import type {
  NormalizedErrorCategory,
  NormalizedJobStatus,
} from "@/lib/images/providers/types";
import type { ImageJobStatus } from "@/types/database";

/**
 * The job state machine.
 *
 * Provider callbacks arrive out of order and more than once — a "running"
 * notification can land after "succeeded", and a webhook can be redelivered
 * hours later. Every write therefore states which states it is allowed to
 * move from, and terminal states are never left. Without that, a late
 * delivery can resurrect a finished job.
 *
 * See docs/image-generation-workflow.md §4.
 */

export const TERMINAL_STATUSES: readonly ImageJobStatus[] = [
  "stored",
  "failed",
  "cancelled",
  "expired",
];

/** Statuses a worker may lease. */
export const CLAIMABLE_STATUSES: readonly ImageJobStatus[] = [
  "queued",
  "submitted",
  "running",
  "succeeded",
];

const ALLOWED_TRANSITIONS: Record<ImageJobStatus, readonly ImageJobStatus[]> = {
  queued: ["submitting", "cancelled", "expired"],
  // Back to queued when submission fails transiently.
  submitting: ["submitted", "queued", "failed", "cancelled", "expired"],
  submitted: ["running", "succeeded", "queued", "failed", "cancelled", "expired"],
  running: ["succeeded", "queued", "failed", "cancelled", "expired"],
  succeeded: ["downloading", "failed", "cancelled", "expired"],
  // Back to queued when ingest fails transiently.
  downloading: ["stored", "queued", "failed", "cancelled", "expired"],
  stored: [],
  failed: [],
  cancelled: [],
  expired: [],
};

export function isTerminalStatus(status: ImageJobStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransition(
  from: ImageJobStatus,
  to: ImageJobStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * States a transition into `to` may legally start from.
 *
 * Passed straight into the UPDATE's WHERE clause, so the guard is enforced
 * by the database rather than by a read-then-write that another worker
 * could interleave with.
 */
export function allowedSourceStatuses(
  to: ImageJobStatus,
): readonly ImageJobStatus[] {
  return (Object.keys(ALLOWED_TRANSITIONS) as ImageJobStatus[]).filter(
    (from) => canTransition(from, to),
  );
}

/** Map a provider's normalized status onto our own job status. */
export function jobStatusFromProviderStatus(
  status: NormalizedJobStatus,
): ImageJobStatus {
  switch (status) {
    case "submitted":
      return "submitted";
    case "running":
      return "running";
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
  }
}

// --- Retry scheduling -------------------------------------------------------

const BASE_BACKOFF_SECONDS = 30;
const MAX_BACKOFF_SECONDS = 15 * 60;
const MAX_JITTER_SECONDS = 10;

/**
 * When to try again after a transient failure.
 *
 * Exponential from 30s, capped at 15 minutes. The jitter matters more than
 * it looks: a provider outage fails every in-flight job at once, and without
 * it they would all retry in the same instant and hammer the provider the
 * moment it recovers.
 *
 * A provider-supplied Retry-After always wins — it knows more than we do.
 */
export function computeBackoffSeconds(
  attemptCount: number,
  retryAfterSeconds?: number,
  jitter: number = Math.random(),
): number {
  if (retryAfterSeconds !== undefined && retryAfterSeconds >= 0) {
    return retryAfterSeconds;
  }

  const exponential = BASE_BACKOFF_SECONDS * 2 ** Math.max(attemptCount, 0);

  return (
    Math.min(exponential, MAX_BACKOFF_SECONDS) + jitter * MAX_JITTER_SECONDS
  );
}

export function computeNextAttemptAt(
  attemptCount: number,
  retryAfterSeconds?: number,
  now: Date = new Date(),
): Date {
  const seconds = computeBackoffSeconds(attemptCount, retryAfterSeconds);

  return new Date(now.getTime() + seconds * 1000);
}

export type FailureDisposition =
  | { kind: "retry"; nextAttemptAt: Date }
  | { kind: "fail" }
  | { kind: "fail_and_open_circuit" };

/**
 * What to do about a failure.
 *
 * Retry only transient and integrity errors, and only while attempts
 * remain. Auth and budget failures additionally stop the whole provider:
 * a lapsed key fails every queued job identically, and retrying each one
 * through its full budget just multiplies the noise.
 */
export function decideFailureDisposition(params: {
  category: NormalizedErrorCategory;
  attemptCount: number;
  maxAttempts: number;
  retryAfterSeconds?: number;
  now?: Date;
}): FailureDisposition {
  const { category, attemptCount, maxAttempts, retryAfterSeconds, now } =
    params;

  if (category === "auth" || category === "budget") {
    return { kind: "fail_and_open_circuit" };
  }

  const retryable = category === "transient" || category === "integrity";

  if (!retryable || attemptCount + 1 >= maxAttempts) {
    return { kind: "fail" };
  }

  return {
    kind: "retry",
    nextAttemptAt: computeNextAttemptAt(attemptCount + 1, retryAfterSeconds, now),
  };
}
