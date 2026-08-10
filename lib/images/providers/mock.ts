import {
  getMockFailureRate,
  getMockLatencyMs,
  getMockPartialFailureRate,
} from "@/lib/images/env";
import { renderMockPng, toDataUrl } from "@/lib/images/providers/mock-image";
import {
  ASPECT_RATIOS,
  type BuiltPrompt,
  type GenerationRequest,
  type ImageProvider,
  type PollResult,
  type ProviderCapabilities,
  type ProviderImage,
  type SubmitResult,
} from "@/lib/images/providers/types";

/**
 * In-process stand-in for a real image provider.
 *
 * A mock that always succeeds instantly proves nothing: the parts of the
 * pipeline most likely to be wrong are the retry path, the reaper, and
 * partial failure. So this one reproduces them on demand — latency, jobs
 * that fail transiently, and jobs where some variants arrive and others do
 * not.
 *
 * Failures are keyed off the idempotency key rather than Math.random(), so
 * a job that fails once fails the same way every time it is replayed. That
 * is the difference between a reproducible bug and a flaky one.
 */

const MOCK_PROVIDER_PREFIX = "mock";

export const MOCK_CAPABILITIES: ProviderCapabilities = {
  maxVariants: 8,
  supportedAspectRatios: ASPECT_RATIOS,
  supportsWebhook: false,
  supportsSeed: true,
  supportsNegativePrompt: true,
  supportsReferenceImage: false,
  typicalLatencySeconds: 3,
  estimatedCostPerImageJpy: 0,
  // Nothing was generated, so nothing is licensed either way.
  commercialUseGranted: true,
};

/** Stable 0.0–1.0 value derived from a key. Same key, same value, always. */
function stableUnitValue(key: string): number {
  let hash = 2166136261;

  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 0xffffffff;
}

type MockJobHandle = {
  submittedAtMs: number;
  idempotencyKey: string;
  aspectRatio: GenerationRequest["aspectRatio"];
  variantCount: number;
};

/**
 * Encode job state into the provider job id.
 *
 * Serverless invocations share no memory, so the mock cannot hold a job
 * table. Putting the state in the id means poll() works from any process,
 * exactly as a real provider's would.
 */
function encodeJobId(request: GenerationRequest): string {
  const payload: MockJobHandle = {
    submittedAtMs: Date.now(),
    idempotencyKey: request.idempotencyKey,
    aspectRatio: request.aspectRatio,
    variantCount: request.variantCount,
  };

  return `${MOCK_PROVIDER_PREFIX}_${Buffer.from(
    JSON.stringify(payload),
  ).toString("base64url")}`;
}

function decodeJobId(providerJobId: string): MockJobHandle | null {
  if (!providerJobId.startsWith(`${MOCK_PROVIDER_PREFIX}_`)) {
    return null;
  }

  try {
    const encoded = providerJobId.slice(MOCK_PROVIDER_PREFIX.length + 1);
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as MockJobHandle;

    return typeof parsed.submittedAtMs === "number" ? parsed : null;
  } catch {
    return null;
  }
}

function buildImages(handle: MockJobHandle): ProviderImage[] {
  const partialFailureRate = getMockPartialFailureRate();

  return Array.from({ length: handle.variantCount }, (_, index) => {
    const seed = `${handle.idempotencyKey}:${index}`;

    // A variant selected for partial failure gets an unreachable URL, so
    // the ingest step records a per-variant download_error while its
    // siblings succeed.
    if (stableUnitValue(`partial:${seed}`) < partialFailureRate) {
      return {
        index,
        url: "https://mock.invalid/unreachable.png",
        width: 0,
        height: 0,
      };
    }

    const image = renderMockPng({ aspectRatio: handle.aspectRatio, seed });

    return {
      index,
      url: toDataUrl(image),
      width: image.width,
      height: image.height,
    };
  });
}

export class MockImageProvider implements ImageProvider {
  readonly id = "mock" as const;
  readonly capabilities = MOCK_CAPABILITIES;

  buildPrompt(request: GenerationRequest): BuiltPrompt {
    // Mirrors the shape of a real adapter: the neutral RenderSpec fields are
    // mapped into this provider's own vocabulary here, never upstream.
    const params: Record<string, unknown> = {
      aspect_ratio: request.aspectRatio,
      stylize: Math.round(request.stylization * 1000),
      chaos: Math.round(request.variation * 100),
      quality: request.detailLevel,
      count: request.variantCount,
    };

    if (request.seed !== undefined) {
      params.seed = request.seed;
    }

    if (request.negative.length > 0) {
      params.negative = request.negative.join(", ");
    }

    return { prompt: request.basePrompt, params };
  }

  async submit(request: GenerationRequest): Promise<SubmitResult> {
    if (request.variantCount > this.capabilities.maxVariants) {
      throw new Error(
        `Mock provider supports at most ${this.capabilities.maxVariants} variants.`,
      );
    }

    const providerJobId = encodeJobId(request);

    return {
      providerJobId,
      status: "submitted",
      raw: { provider: "mock", providerJobId, request: this.buildPrompt(request) },
    };
  }

  async poll(providerJobId: string): Promise<PollResult> {
    const handle = decodeJobId(providerJobId);

    if (!handle) {
      return {
        status: "failed",
        images: [],
        error: {
          category: "permanent",
          code: "unknown_job",
          message: `Unrecognised mock job id: ${providerJobId}`,
        },
        raw: { providerJobId },
      };
    }

    const elapsedMs = Date.now() - handle.submittedAtMs;
    const latencyMs = getMockLatencyMs();

    if (elapsedMs < latencyMs) {
      return {
        status: "running",
        progress:
          latencyMs === 0 ? 100 : Math.floor((elapsedMs / latencyMs) * 100),
        images: [],
        raw: { providerJobId, elapsedMs },
      };
    }

    // Transient failure, decided once per job and stable across replays.
    if (stableUnitValue(handle.idempotencyKey) < getMockFailureRate()) {
      return {
        status: "failed",
        images: [],
        error: {
          category: "transient",
          code: "mock_transient",
          message: "Injected transient failure (IMAGE_MOCK_FAILURE_RATE).",
          retryAfterSeconds: 1,
        },
        raw: { providerJobId, injected: true },
      };
    }

    return {
      status: "succeeded",
      progress: 100,
      images: buildImages(handle),
      actualCostJpy: 0,
      raw: { providerJobId, elapsedMs },
    };
  }

  async parseWebhook(): Promise<null> {
    // The mock has no callback channel; the runner polls it instead.
    return null;
  }

  async cancel(): Promise<void> {
    // Nothing is running server-side, so cancelling is a no-op.
  }

  estimateCostJpy(request: GenerationRequest): number {
    return this.capabilities.estimatedCostPerImageJpy * request.variantCount;
  }
}

export const mockImageProvider = new MockImageProvider();
