import "server-only";

import { randomUUID } from "node:crypto";

import {
  expireStaleJobs,
  insertImageResults,
  recordCost,
  recordProviderEvent,
  releaseExpiredLeases,
  releaseJobLease,
  transitionJob,
} from "@/lib/db/images/job-repository";
import { claimImageJobs } from "@/lib/db/images/repository";
import {
  attemptIdempotencyKey,
  InvalidGenerationRequestError,
  parseGenerationRequest,
} from "@/lib/images/jobs/generation-request";
import {
  decideFailureDisposition,
  jobStatusFromProviderStatus,
} from "@/lib/images/jobs/state-machine";
import type {
  GenerationRequest,
  ImageProvider,
  NormalizedError,
  PollResult,
} from "@/lib/images/providers/types";
import { runImageQaTick } from "@/lib/images/jobs/qa-runner";
import { enqueueOutboxEvent } from "@/lib/images/outbox";
import { getImageProvider } from "@/lib/images/providers/registry";
import {
  downloadProviderImage,
  ImageIngestError,
  storeDraftImage,
} from "@/lib/images/storage";
import type { AdminImageJob } from "@/types/admin-image";
import type { ImageGenerationResultInsert } from "@/types/database";

/**
 * The job runner.
 *
 * One tick advances every job by at most one step, then returns. It is
 * deliberately not a loop that drains the queue: each invocation must fit
 * inside a serverless function's time budget, and the caller (cron, webhook
 * follow-up, or the drain script) decides how often to come back.
 *
 * Ordering matters. Reclaiming leases runs first so a worker that died
 * mid-step does not block this tick, and ingest runs last so images land
 * as soon as they are available.
 *
 * See docs/image-generation-workflow.md §3.2 and §4.
 */

const DEFAULT_BATCH_SIZE = 5;
const LEASE_SECONDS = 120;

export type TickCounts = {
  leasesReleased: number;
  jobsExpired: number;
  submitted: number;
  polled: number;
  ingested: number;
  qaEvaluated: number;
  failed: number;
  retried: number;
};

export type TickResult = {
  workerId: string;
  provider: string;
  counts: TickCounts;
  /** Set when an auth or budget failure stopped the provider outright. */
  circuitOpenReason?: string;
};

function emptyCounts(): TickCounts {
  return {
    leasesReleased: 0,
    jobsExpired: 0,
    submitted: 0,
    polled: 0,
    ingested: 0,
    qaEvaluated: 0,
    failed: 0,
    retried: 0,
  };
}

/**
 * Rebuild the provider request from what the job stored.
 *
 * Reading the job rather than the concept is deliberate: a retry must
 * re-send exactly what was sent before, even if someone edited the concept
 * in the meantime. The idempotency key is re-derived from the current
 * attempt so a resend within one attempt is not billed twice, while
 * advancing to a new attempt deliberately spends again.
 */
function toGenerationRequest(job: AdminImageJob): GenerationRequest {
  const request = parseGenerationRequest(job.submittedParams);

  return {
    ...request,
    idempotencyKey: attemptIdempotencyKey(job.id, job.attemptCount),
    variantCount: job.requestedVariantCount,
  };
}

async function handleFailure(
  job: AdminImageJob,
  error: NormalizedError,
  counts: TickCounts,
): Promise<string | undefined> {
  const disposition = decideFailureDisposition({
    category: error.category,
    attemptCount: job.attemptCount,
    maxAttempts: job.maxAttempts,
    retryAfterSeconds: error.retryAfterSeconds,
  });

  if (disposition.kind === "retry") {
    await transitionJob(job.id, "queued", {
      attempt_count: job.attemptCount + 1,
      next_attempt_at: disposition.nextAttemptAt.toISOString(),
      error_category: error.category,
      error_code: error.code,
      error_message: error.message,
      claimed_by: null,
      claimed_at: null,
      lease_expires_at: null,
    });
    counts.retried += 1;
    return undefined;
  }

  await transitionJob(job.id, "failed", {
    error_category: error.category,
    error_code: error.code,
    error_message: error.message,
    completed_at: new Date().toISOString(),
    claimed_by: null,
    claimed_at: null,
    lease_expires_at: null,
  });
  counts.failed += 1;

  await enqueueOutboxEvent("image.job_failed", {
    jobId: job.id,
    category: error.category,
    code: error.code,
    message: error.message,
    circuitOpened: disposition.kind === "fail_and_open_circuit",
  });

  return disposition.kind === "fail_and_open_circuit"
    ? `${error.category}: ${error.message}`
    : undefined;
}

async function submitQueuedJobs(
  provider: ImageProvider,
  workerId: string,
  batchSize: number,
  counts: TickCounts,
): Promise<string | undefined> {
  const jobs = await claimImageJobs(workerId, ["queued"], batchSize, LEASE_SECONDS);
  let circuitReason: string | undefined;

  for (const job of jobs) {
    const moved = await transitionJob(job.id, "submitting", {});

    if (!moved.applied) {
      // Cancelled or expired between the claim and here.
      await releaseJobLease(job.id);
      continue;
    }

    try {
      const result = await provider.submit(toGenerationRequest(job));

      await recordProviderEvent({
        jobId: job.id,
        provider: provider.id,
        source: "submit",
        payload: result.raw,
      });

      // Release the lease with the status write. claim_image_jobs only
      // picks rows whose lease is null or expired, so holding it here
      // would hide the job from this tick's poll (and from other ticks
      // for LEASE_SECONDS). Submit is done; the next stage must be free
      // to claim.
      await transitionJob(job.id, jobStatusFromProviderStatus(result.status), {
        provider_job_id: result.providerJobId,
        submitted_at: new Date().toISOString(),
        claimed_by: null,
        claimed_at: null,
        lease_expires_at: null,
      });
      counts.submitted += 1;
    } catch (error) {
      // A malformed stored request will never succeed, however many times
      // it is retried, so it fails permanently rather than burning attempts.
      const category =
        error instanceof InvalidGenerationRequestError
          ? "permanent"
          : "transient";

      const reason = await handleFailure(
        job,
        {
          category,
          code:
            category === "permanent" ? "invalid_request" : "submit_failed",
          message: error instanceof Error ? error.message : String(error),
        },
        counts,
      );
      circuitReason ??= reason;
    }
  }

  return circuitReason;
}

async function pollActiveJobs(
  provider: ImageProvider,
  workerId: string,
  batchSize: number,
  counts: TickCounts,
): Promise<string | undefined> {
  const jobs = await claimImageJobs(
    workerId,
    ["submitted", "running"],
    batchSize,
    LEASE_SECONDS,
  );
  let circuitReason: string | undefined;

  for (const job of jobs) {
    if (!job.providerJobId) {
      await handleFailure(
        job,
        {
          category: "permanent",
          code: "missing_provider_job_id",
          message: "Job reached polling without a provider job id.",
        },
        counts,
      );
      continue;
    }

    let result: PollResult;

    try {
      result = await provider.poll(job.providerJobId);
    } catch (error) {
      circuitReason ??= await handleFailure(
        job,
        {
          category: "transient",
          code: "poll_failed",
          message: error instanceof Error ? error.message : String(error),
        },
        counts,
      );
      continue;
    }

    await recordProviderEvent({
      jobId: job.id,
      provider: provider.id,
      source: "poll",
      payload: result.raw,
    });
    counts.polled += 1;

    if (result.status === "failed" && result.error) {
      circuitReason ??= await handleFailure(job, result.error, counts);
      continue;
    }

    const next = jobStatusFromProviderStatus(result.status);

    await transitionJob(job.id, next, {
      claimed_by: null,
      claimed_at: null,
      lease_expires_at: null,
      ...(result.actualCostJpy !== undefined
        ? { actual_cost_jpy: result.actualCostJpy }
        : {}),
    });

    if (result.actualCostJpy) {
      await recordCost({
        jobId: job.id,
        kind: "image_provider",
        provider: provider.id,
        amountJpy: result.actualCostJpy,
      });
    }
  }

  return circuitReason;
}

/**
 * Pull finished images into private storage.
 *
 * Partial failure is expected and survivable: a variant that cannot be
 * fetched is recorded with a download_error while its siblings are stored
 * normally, and the job still reaches `stored`. Failing the whole job would
 * throw away images the reviewer could have used.
 */
async function ingestSucceededJobs(
  provider: ImageProvider,
  workerId: string,
  batchSize: number,
  counts: TickCounts,
): Promise<void> {
  const jobs = await claimImageJobs(
    workerId,
    ["succeeded"],
    batchSize,
    LEASE_SECONDS,
  );

  for (const job of jobs) {
    const moved = await transitionJob(job.id, "downloading", {});

    if (!moved.applied) {
      await releaseJobLease(job.id);
      continue;
    }

    if (!job.providerJobId) {
      await transitionJob(job.id, "failed", {
        error_category: "permanent",
        error_code: "missing_provider_job_id",
        error_message: "Job reached ingest without a provider job id.",
        completed_at: new Date().toISOString(),
        claimed_by: null,
        claimed_at: null,
        lease_expires_at: null,
      });
      counts.failed += 1;
      continue;
    }

    let poll: PollResult;

    try {
      poll = await provider.poll(job.providerJobId);
    } catch (error) {
      await handleFailure(
        job,
        {
          category: "transient",
          code: "ingest_poll_failed",
          message: error instanceof Error ? error.message : String(error),
        },
        counts,
      );
      continue;
    }

    const rows: ImageGenerationResultInsert[] = [];

    for (const image of poll.images) {
      const base: ImageGenerationResultInsert = {
        job_id: job.id,
        variant_index: image.index,
        source_url: image.url.startsWith("data:") ? null : image.url,
        source_url_expires_at: image.urlExpiresAt ?? null,
        width: image.width ?? null,
        height: image.height ?? null,
      };

      try {
        const downloaded = await downloadProviderImage(image.url);
        const stored = await storeDraftImage(job.id, image.index, downloaded);

        rows.push({
          ...base,
          storage_bucket: stored.bucket,
          storage_path: stored.path,
          content_type: stored.contentType,
          bytes: stored.bytes,
          checksum: stored.checksum,
        });
      } catch (error) {
        // This variant only. The job continues.
        rows.push({
          ...base,
          download_error:
            error instanceof ImageIngestError
              ? error.message
              : error instanceof Error
                ? error.message
                : String(error),
        });
      }
    }

    await insertImageResults(rows);

    // Deliberately no signed URL in the payload: it would land in an n8n
    // execution log where anyone with access could open an unapproved
    // image. Send the id and let the reviewer open the admin screen.
    await enqueueOutboxEvent("image.review_pending", {
      jobId: job.id,
      conceptId: job.conceptId,
      storedCount: rows.filter((row) => !row.download_error).length,
      failedCount: rows.filter((row) => row.download_error).length,
    });

    await transitionJob(job.id, "stored", {
      completed_at: new Date().toISOString(),
      claimed_by: null,
      claimed_at: null,
      lease_expires_at: null,
    });
    counts.ingested += rows.filter((row) => !row.download_error).length;
  }
}

export type TickOptions = {
  workerId?: string;
  batchSize?: number;
};

export async function runImageTick(
  options: TickOptions = {},
): Promise<TickResult> {
  const workerId = options.workerId ?? `tick-${randomUUID().slice(0, 8)}`;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const provider = getImageProvider();
  const counts = emptyCounts();

  // Housekeeping first: a lease held by a dead worker would otherwise make
  // its job invisible to this tick.
  counts.leasesReleased = await releaseExpiredLeases();
  counts.jobsExpired = await expireStaleJobs();

  const submitReason = await submitQueuedJobs(
    provider,
    workerId,
    batchSize,
    counts,
  );
  const pollReason = await pollActiveJobs(provider, workerId, batchSize, counts);

  await ingestSucceededJobs(provider, workerId, batchSize, counts);

  // Runs last and never throws: an image without an AI verdict still
  // reaches the reviewer, just without the hint.
  try {
    const qa = await runImageQaTick();
    counts.qaEvaluated = qa.evaluated;
  } catch {
    // Intentionally ignored — see runImageQaTick.
  }

  return {
    workerId,
    provider: provider.id,
    counts,
    circuitOpenReason: submitReason ?? pollReason,
  };
}
