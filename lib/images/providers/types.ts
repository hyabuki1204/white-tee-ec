/**
 * The contract every image generation provider implements.
 *
 * Midjourney has no official API, so any "Midjourney API" is an unofficial
 * proxy that may change, be rate-limited, or disappear. This interface exists
 * so that losing one costs a single adapter file: everything upstream speaks
 * the provider-neutral shapes below, and the RenderSpec that produced a
 * request is kept in the database so the same work can be re-rendered
 * elsewhere.
 *
 * See docs/image-generation-workflow.md §6.
 */

export type ImageProviderId =
  | "mock"
  | "midjourney_proxy"
  | "replicate_flux"
  | "openai_images";

export type AspectRatio = "1:1" | "4:5" | "3:2" | "3:4" | "16:9";

export const ASPECT_RATIOS: readonly AspectRatio[] = [
  "1:1",
  "4:5",
  "3:2",
  "3:4",
  "16:9",
];

/** Pixel dimensions for an aspect ratio at a given long edge. */
export function aspectRatioDimensions(
  ratio: AspectRatio,
  longEdge: number,
): { width: number; height: number } {
  const [a, b] = ratio.split(":").map(Number);
  const isLandscape = a >= b;
  const shortEdge = Math.round((longEdge * Math.min(a, b)) / Math.max(a, b));

  return isLandscape
    ? { width: longEdge, height: shortEdge }
    : { width: shortEdge, height: longEdge };
}

/**
 * A generation request, free of provider-specific vocabulary.
 *
 * Claude produces a RenderSpec in these terms and never writes provider
 * flags like `--ar 4:5 --stylize 250`; turning this into a provider's own
 * parameter language is the adapter's job. That is what makes a provider
 * swap a one-file change instead of a rewrite of every stored prompt.
 */
export type GenerationRequest = {
  idempotencyKey: string;
  basePrompt: string;
  negative: string[];
  aspectRatio: AspectRatio;
  /** 0.0–1.0, normalized. Each adapter maps this onto its own scale. */
  stylization: number;
  /** 0.0–1.0, normalized. Midjourney's `chaos` equivalent. */
  variation: number;
  detailLevel: "low" | "standard" | "high";
  variantCount: number;
  seed?: number;
  referenceImageUrls?: string[];
  webhookUrl?: string;
};

export type NormalizedJobStatus =
  | "submitted"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

/**
 * Error classes that drive retry policy. Mapping a provider's own error
 * codes onto these is the adapter's responsibility — the job runner never
 * sees a raw provider error.
 */
export type NormalizedErrorCategory =
  | "transient" // 429 / 5xx / timeout -> retry with backoff
  | "permanent" // 400 / 422 -> do not retry
  | "policy" // content policy refusal -> escalate to a human
  | "auth" // 401 / 403 -> open the circuit breaker
  | "budget" // out of credit -> open the circuit breaker
  | "integrity"; // corrupt or unreachable image

export type NormalizedError = {
  category: NormalizedErrorCategory;
  code: string;
  message: string;
  /** Honoured ahead of the computed backoff when a provider sends it. */
  retryAfterSeconds?: number;
};

export type ProviderImage = {
  index: number;
  url: string;
  /** Provider CDNs expire. Ingest promptly; never treat this as durable. */
  urlExpiresAt?: string;
  width?: number;
  height?: number;
};

export type SubmitResult = {
  providerJobId: string;
  status: NormalizedJobStatus;
  /** Raw payload, persisted to image_provider_events for debugging. */
  raw: unknown;
};

export type PollResult = {
  status: NormalizedJobStatus;
  /** 0–100 when the provider reports it. */
  progress?: number;
  images: ProviderImage[];
  error?: NormalizedError;
  actualCostJpy?: number;
  raw: unknown;
};

export type ProviderCapabilities = {
  maxVariants: number;
  supportedAspectRatios: readonly AspectRatio[];
  supportsWebhook: boolean;
  supportsSeed: boolean;
  supportsNegativePrompt: boolean;
  supportsReferenceImage: boolean;
  typicalLatencySeconds: number;
  estimatedCostPerImageJpy: number;
  /**
   * Whether commercial use is explicitly granted for output from this
   * provider. Recorded onto image_assets.license_note at approval time;
   * never used to gate approval. WHITE TEE has accepted that rights need
   * not be assigned to the company (design doc §7.9).
   */
  commercialUseGranted: boolean;
};

export type BuiltPrompt = {
  prompt: string;
  params: Record<string, unknown>;
};

export interface ImageProvider {
  readonly id: ImageProviderId;
  readonly capabilities: ProviderCapabilities;

  /**
   * Render a request into this provider's own prompt language.
   * Exposed separately from submit() so the exact string sent can be shown
   * in the admin UI and stored on the job before anything is billed.
   */
  buildPrompt(request: GenerationRequest): BuiltPrompt;

  submit(request: GenerationRequest): Promise<SubmitResult>;

  poll(providerJobId: string): Promise<PollResult>;

  /**
   * Verify and decode a webhook delivery. Throws on a bad signature;
   * returns null for a delivery this provider does not recognise.
   */
  parseWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<{ providerJobId: string; event: PollResult } | null>;

  cancel?(providerJobId: string): Promise<void>;

  estimateCostJpy(request: GenerationRequest): number;
}

/** Terminal states: a job in one of these will never change again. */
export function isTerminalProviderStatus(
  status: NormalizedJobStatus,
): boolean {
  return (
    status === "succeeded" || status === "failed" || status === "cancelled"
  );
}

export function isRetryableErrorCategory(
  category: NormalizedErrorCategory,
): boolean {
  return category === "transient" || category === "integrity";
}

/**
 * Errors that should stop every job for this provider, not just the one
 * that failed. Without this, a lapsed key or an empty balance produces a
 * queue of jobs each burning its full retry budget.
 */
export function opensCircuitBreaker(
  category: NormalizedErrorCategory,
): boolean {
  return category === "auth" || category === "budget";
}
