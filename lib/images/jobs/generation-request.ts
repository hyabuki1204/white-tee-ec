import {
  ASPECT_RATIOS,
  type AspectRatio,
  type GenerationRequest,
} from "@/lib/images/providers/types";

/**
 * Serialising and restoring the provider-neutral GenerationRequest.
 *
 * A job stores the request it submitted rather than a reference to the
 * concept that produced it. That keeps a retry byte-identical to the
 * original submission even if the concept was edited in between, and it is
 * what makes replaying the same work on a different provider possible when
 * one disappears.
 *
 * Restoring goes through validation because the value comes back as
 * untyped jsonb: a malformed row should fail the job with a clear message,
 * not send nonsense to a paid API.
 */

const DETAIL_LEVELS = ["low", "standard", "high"] as const;

export class InvalidGenerationRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidGenerationRequestError";
  }
}

export function serializeGenerationRequest(
  request: GenerationRequest,
): Record<string, unknown> {
  return { ...request };
}

function requireString(
  value: unknown,
  field: string,
  { allowEmpty = false } = {},
): string {
  if (typeof value !== "string" || (!allowEmpty && value.length === 0)) {
    throw new InvalidGenerationRequestError(
      `Stored request field "${field}" must be a non-empty string.`,
    );
  }

  return value;
}

function requireUnitNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidGenerationRequestError(
      `Stored request field "${field}" must be a number.`,
    );
  }

  return Math.min(Math.max(value, 0), 1);
}

function requireStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
    throw new InvalidGenerationRequestError(
      `Stored request field "${field}" must be an array of strings.`,
    );
  }

  return value as string[];
}

export function parseGenerationRequest(
  raw: Record<string, unknown>,
): GenerationRequest {
  const aspectRatio = raw.aspectRatio;

  if (
    typeof aspectRatio !== "string" ||
    !ASPECT_RATIOS.includes(aspectRatio as AspectRatio)
  ) {
    throw new InvalidGenerationRequestError(
      `Stored request has an unsupported aspectRatio: ${String(aspectRatio)}`,
    );
  }

  const detailLevel = raw.detailLevel;

  if (
    typeof detailLevel !== "string" ||
    !DETAIL_LEVELS.includes(detailLevel as (typeof DETAIL_LEVELS)[number])
  ) {
    throw new InvalidGenerationRequestError(
      `Stored request has an unsupported detailLevel: ${String(detailLevel)}`,
    );
  }

  const variantCount = raw.variantCount;

  if (
    typeof variantCount !== "number" ||
    !Number.isInteger(variantCount) ||
    variantCount < 1
  ) {
    throw new InvalidGenerationRequestError(
      `Stored request has an invalid variantCount: ${String(variantCount)}`,
    );
  }

  const seed = raw.seed;

  if (seed !== undefined && seed !== null && typeof seed !== "number") {
    throw new InvalidGenerationRequestError(
      "Stored request field \"seed\" must be a number when present.",
    );
  }

  return {
    idempotencyKey: requireString(raw.idempotencyKey, "idempotencyKey"),
    basePrompt: requireString(raw.basePrompt, "basePrompt"),
    negative: requireStringArray(raw.negative, "negative"),
    aspectRatio: aspectRatio as AspectRatio,
    stylization: requireUnitNumber(raw.stylization, "stylization"),
    variation: requireUnitNumber(raw.variation, "variation"),
    detailLevel: detailLevel as GenerationRequest["detailLevel"],
    variantCount,
    ...(typeof seed === "number" ? { seed } : {}),
    ...(raw.referenceImageUrls !== undefined
      ? {
          referenceImageUrls: requireStringArray(
            raw.referenceImageUrls,
            "referenceImageUrls",
          ),
        }
      : {}),
    ...(typeof raw.webhookUrl === "string"
      ? { webhookUrl: raw.webhookUrl }
      : {}),
  };
}

/**
 * The idempotency key for a given attempt.
 *
 * Retries of the same attempt reuse the key so a provider that supports
 * idempotency will not bill twice for a resend. Advancing the attempt is a
 * deliberate decision to spend again, and gets a new key.
 */
export function attemptIdempotencyKey(
  jobId: string,
  attemptCount: number,
): string {
  return `${jobId}:${attemptCount}`;
}
