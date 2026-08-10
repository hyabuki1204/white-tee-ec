import {
  getImageProviderApiKey,
  getImageProviderBaseUrl,
} from "@/lib/images/env";
import {
  ASPECT_RATIOS,
  type AspectRatio,
  type BuiltPrompt,
  type GenerationRequest,
  type ImageProvider,
  type NormalizedError,
  type PollResult,
  type ProviderCapabilities,
  type ProviderImage,
  type SubmitResult,
} from "@/lib/images/providers/types";

/**
 * FLUX 2 Pro (Black Forest Labs).
 *
 * Chosen over Midjourney proxies because it has an official API, so none of
 * the terms-of-service exposure applies, and because its multi-reference
 * support is the mechanism for keeping a series of posts looking like one
 * brand rather than a set of unrelated good images.
 *
 * Two things about this provider shape the adapter:
 *
 * 1. One request returns ONE image. A four-variant job is four requests.
 *    The job table stores a single provider_job_id, so this adapter packs
 *    its sub-request ids into that one opaque string. Nothing upstream
 *    knows or cares — which is the abstraction doing its job: a provider
 *    with completely different granularity dropped in without a schema
 *    change.
 *
 * 2. Result URLs expire ten minutes after a job becomes Ready. See the
 *    warning on poll() — this constrains how late a tick can run.
 *
 * See docs/image-generation-workflow.md §6.1.1.
 */

const DEFAULT_BASE_URL = "https://api.bfl.ai/v1";
const MODEL_PATH = "flux-2-pro";
const PROVIDER_PREFIX = "flux";

/** Roughly $0.03 per image at 1MP, at 150 JPY to the dollar. */
const COST_PER_IMAGE_JPY = 4.5;

export const FLUX_CAPABILITIES: ProviderCapabilities = {
  maxVariants: 8,
  supportedAspectRatios: ASPECT_RATIOS,
  // Deliberately false. FLUX does support webhook_url, but a job here is
  // several sub-requests, so a webhook arrives once per variant and the
  // handler has to reassemble them. Polling is correct first; see the
  // design doc before enabling this.
  supportsWebhook: false,
  supportsSeed: true,
  supportsNegativePrompt: false,
  supportsReferenceImage: true,
  typicalLatencySeconds: 20,
  estimatedCostPerImageJpy: COST_PER_IMAGE_JPY,
  commercialUseGranted: true,
};

type FluxSubmitResponse = { id: string; polling_url: string };

type FluxPollResponse = {
  status: "Pending" | "Ready" | "Error" | "Failed" | string;
  result?: { sample?: string; seed?: number } | null;
  details?: unknown;
};

function baseUrl(): string {
  return (getImageProviderBaseUrl() ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function apiKey(): string {
  const key = getImageProviderApiKey();

  if (!key) {
    throw new Error("IMAGE_PROVIDER_API_KEY is not set for the FLUX provider.");
  }

  return key;
}

/**
 * Map an HTTP status onto a retry decision.
 *
 * Getting this wrong is expensive in both directions: retrying a 402
 * wastes the remaining attempts on a job that cannot succeed, and failing
 * a 429 permanently throws away work that would have gone through.
 */
function classifyHttpError(status: number, body: string): NormalizedError {
  if (status === 401 || status === 403) {
    return { category: "auth", code: `http_${status}`, message: body };
  }

  if (status === 402) {
    return { category: "budget", code: "insufficient_credit", message: body };
  }

  if (status === 429) {
    return { category: "transient", code: "rate_limited", message: body };
  }

  if (status >= 500) {
    return { category: "transient", code: `http_${status}`, message: body };
  }

  return { category: "permanent", code: `http_${status}`, message: body };
}

/** Pack the per-variant sub-request ids into one opaque provider job id. */
function encodeJobId(entries: { index: number; pollingUrl: string }[]): string {
  return `${PROVIDER_PREFIX}_${Buffer.from(JSON.stringify(entries)).toString(
    "base64url",
  )}`;
}

function decodeJobId(
  providerJobId: string,
): { index: number; pollingUrl: string }[] | null {
  if (!providerJobId.startsWith(`${PROVIDER_PREFIX}_`)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(
        providerJobId.slice(PROVIDER_PREFIX.length + 1),
        "base64url",
      ).toString("utf8"),
    );

    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export class FluxImageProvider implements ImageProvider {
  readonly id = "replicate_flux" as const;
  readonly capabilities = FLUX_CAPABILITIES;

  buildPrompt(request: GenerationRequest): BuiltPrompt {
    // FLUX has no negative-prompt field, so exclusions are folded into the
    // prompt rather than silently dropped.
    const exclusions =
      request.negative.length > 0
        ? ` Do not include: ${request.negative.join(", ")}.`
        : "";

    const params: Record<string, unknown> = {
      aspect_ratio: request.aspectRatio,
      output_format: "png",
      // Normalized 0-1 mapped onto this provider's own scale, here and
      // nowhere else.
      prompt_upsampling: request.stylization > 0.6,
    };

    if (request.seed !== undefined) {
      params.seed = request.seed;
    }

    if (request.referenceImageUrls?.length) {
      // The consistency mechanism: the brand reference set is attached to
      // every production job so a series holds one look.
      params.image_prompt = request.referenceImageUrls.slice(0, 9);
    }

    return { prompt: `${request.basePrompt}${exclusions}`, params };
  }

  async submit(request: GenerationRequest): Promise<SubmitResult> {
    const { prompt, params } = this.buildPrompt(request);
    const raw: unknown[] = [];
    const entries: { index: number; pollingUrl: string }[] = [];

    // One request per variant. Sequential rather than parallel so a rate
    // limit surfaces on variant 2 instead of all N at once.
    for (let index = 0; index < request.variantCount; index += 1) {
      const response = await fetch(`${baseUrl()}/${MODEL_PATH}`, {
        method: "POST",
        headers: {
          "x-key": apiKey(),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          ...params,
          // Vary the seed per variant so the four are not identical.
          ...(request.seed !== undefined
            ? { seed: request.seed + index }
            : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const error = classifyHttpError(response.status, body);

        // Any variants already accepted are kept: they will still be
        // billed, so discarding them wastes money as well as work.
        if (entries.length === 0) {
          throw Object.assign(new Error(error.message), { normalized: error });
        }

        break;
      }

      const parsed = (await response.json()) as FluxSubmitResponse;
      raw.push(parsed);
      entries.push({ index, pollingUrl: parsed.polling_url });
    }

    return {
      providerJobId: encodeJobId(entries),
      status: "submitted",
      raw,
    };
  }

  /**
   * Poll every sub-request and aggregate.
   *
   * ⚠️ Result URLs expire ten minutes after a variant reports Ready. The
   * job is only reported succeeded once every variant is done, and the
   * runner ingests on the following tick — so the gap between ticks has to
   * stay well under ten minutes while jobs are in flight, or images are
   * paid for and lost. The GitHub Actions safety net alone is not frequent
   * enough for that; see the design doc.
   */
  async poll(providerJobId: string): Promise<PollResult> {
    const entries = decodeJobId(providerJobId);

    if (!entries || entries.length === 0) {
      return {
        status: "failed",
        images: [],
        error: {
          category: "permanent",
          code: "unknown_job",
          message: `Unrecognised FLUX job id: ${providerJobId}`,
        },
        raw: { providerJobId },
      };
    }

    const images: ProviderImage[] = [];
    const raw: unknown[] = [];
    let pending = 0;
    let firstError: NormalizedError | undefined;

    for (const entry of entries) {
      const response = await fetch(entry.pollingUrl, {
        headers: { "x-key": apiKey() },
      });

      if (!response.ok) {
        const error = classifyHttpError(response.status, await response.text());
        firstError ??= error;
        continue;
      }

      const parsed = (await response.json()) as FluxPollResponse;
      raw.push(parsed);

      if (parsed.status === "Ready" && parsed.result?.sample) {
        images.push({
          index: entry.index,
          url: parsed.result.sample,
          urlExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
        continue;
      }

      if (parsed.status === "Error" || parsed.status === "Failed") {
        firstError ??= {
          category: "permanent",
          code: parsed.status.toLowerCase(),
          message: JSON.stringify(parsed.details ?? parsed.status),
        };
        continue;
      }

      pending += 1;
    }

    if (pending > 0) {
      return {
        status: "running",
        progress: Math.floor((images.length / entries.length) * 100),
        images: [],
        raw,
      };
    }

    // Every variant failing is a job failure; some failing is partial
    // success, which the ingest step already handles per variant.
    if (images.length === 0) {
      return {
        status: "failed",
        images: [],
        error: firstError ?? {
          category: "transient",
          code: "no_images",
          message: "FLUX returned no images.",
        },
        raw,
      };
    }

    return {
      status: "succeeded",
      progress: 100,
      images,
      actualCostJpy: images.length * COST_PER_IMAGE_JPY,
      raw,
    };
  }

  async parseWebhook(): Promise<null> {
    // See supportsWebhook above: one job is several sub-requests, so
    // webhook handling needs reassembly that polling does not.
    return null;
  }

  estimateCostJpy(request: GenerationRequest): number {
    return COST_PER_IMAGE_JPY * request.variantCount;
  }
}

export const fluxImageProvider = new FluxImageProvider();

export function isSupportedFluxAspectRatio(
  ratio: string,
): ratio is AspectRatio {
  return ASPECT_RATIOS.includes(ratio as AspectRatio);
}
