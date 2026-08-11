import { createHmac, timingSafeEqual } from "node:crypto";

import {
  getImageProviderApiKey,
  getImageProviderBaseUrl,
  getImageProviderWebhookSecret,
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
  // Webhooks are supported once IMAGE_PROVIDER_WEBHOOK_SECRET and a public
  // app URL are set. Each delivery is one variant; the route reassembles
  // by polling the composite job id.
  supportsWebhook: true,
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

type FluxJobEntry = {
  index: number;
  id?: string;
  pollingUrl: string;
};

type FluxWebhookBody = {
  id?: string;
  status?: string;
  result?: { sample?: string; seed?: number } | null;
  webhook_secret?: string;
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

function encodeJobId(entries: FluxJobEntry[]): string {
  return `${PROVIDER_PREFIX}_${Buffer.from(JSON.stringify(entries)).toString(
    "base64url",
  )}`;
}

function decodeJobId(providerJobId: string): FluxJobEntry[] | null {
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

    return Array.isArray(parsed) ? (parsed as FluxJobEntry[]) : null;
  } catch {
    return null;
  }
}

/** True when this composite provider job id contains the given FLUX sub-id. */
export function fluxJobContainsSubId(
  providerJobId: string,
  subId: string,
): boolean {
  const entries = decodeJobId(providerJobId);

  if (!entries) {
    return false;
  }

  return entries.some(
    (entry) =>
      entry.id === subId ||
      entry.pollingUrl.includes(subId) ||
      providerJobId.includes(subId),
  );
}

function webhookCallbackUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const secret = getImageProviderWebhookSecret();

  if (!base || !secret) {
    return undefined;
  }

  return `${base}/api/webhooks/images/flux_bfl`;
}

function verifyFluxWebhook(headers: Headers, rawBody: string): void {
  const expected = getImageProviderWebhookSecret();

  if (!expected) {
    throw new Error("IMAGE_PROVIDER_WEBHOOK_SECRET is not configured.");
  }

  const headerSecret =
    headers.get("x-webhook-secret") ?? headers.get("x-bfl-webhook-secret");

  if (headerSecret) {
    const a = Buffer.from(headerSecret);
    const b = Buffer.from(expected);

    if (a.length === b.length && timingSafeEqual(a, b)) {
      return;
    }
  }

  try {
    const parsed = JSON.parse(rawBody) as FluxWebhookBody;

    if (typeof parsed.webhook_secret === "string") {
      const a = Buffer.from(parsed.webhook_secret);
      const b = Buffer.from(expected);

      if (a.length === b.length && timingSafeEqual(a, b)) {
        return;
      }
    }
  } catch {
    // Fall through to HMAC check.
  }

  const signature =
    headers.get("x-signature") ?? headers.get("x-bfl-signature");

  if (signature) {
    const digest = createHmac("sha256", expected).update(rawBody).digest("hex");
    const expectedSig = Buffer.from(digest);
    const received = Buffer.from(signature.replace(/^sha256=/, ""));

    if (
      expectedSig.length === received.length &&
      timingSafeEqual(expectedSig, received)
    ) {
      return;
    }
  }

  throw new Error("Invalid FLUX webhook signature.");
}

export class FluxImageProvider implements ImageProvider {
  readonly id = "flux_bfl" as const;
  readonly capabilities = FLUX_CAPABILITIES;

  buildPrompt(request: GenerationRequest): BuiltPrompt {
    const exclusions =
      request.negative.length > 0
        ? ` Do not include: ${request.negative.join(", ")}.`
        : "";

    const params: Record<string, unknown> = {
      aspect_ratio: request.aspectRatio,
      output_format: "png",
      prompt_upsampling: request.stylization > 0.6,
    };

    if (request.seed !== undefined) {
      params.seed = request.seed;
    }

    if (request.referenceImageUrls?.length) {
      params.image_prompt = request.referenceImageUrls.slice(0, 9);
    }

    return { prompt: `${request.basePrompt}${exclusions}`, params };
  }

  async submit(request: GenerationRequest): Promise<SubmitResult> {
    const { prompt, params } = this.buildPrompt(request);
    const raw: unknown[] = [];
    const entries: FluxJobEntry[] = [];
    const callbackUrl = request.webhookUrl ?? webhookCallbackUrl();
    const webhookSecret = getImageProviderWebhookSecret();

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
          ...(request.seed !== undefined
            ? { seed: request.seed + index }
            : {}),
          ...(callbackUrl && webhookSecret
            ? {
                webhook_url: callbackUrl,
                webhook_secret: webhookSecret,
              }
            : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const error = classifyHttpError(response.status, body);

        if (entries.length === 0) {
          throw Object.assign(new Error(error.message), { normalized: error });
        }

        break;
      }

      const parsed = (await response.json()) as FluxSubmitResponse;
      raw.push(parsed);
      entries.push({
        index,
        id: parsed.id,
        pollingUrl: parsed.polling_url,
      });
    }

    return {
      providerJobId: encodeJobId(entries),
      status: "submitted",
      raw,
    };
  }

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
        });
        continue;
      }

      if (parsed.status === "Error" || parsed.status === "Failed") {
        firstError ??= {
          category: "permanent",
          code: "flux_failed",
          message: `FLUX variant ${entry.index} failed.`,
        };
        continue;
      }

      pending += 1;
    }

    if (pending > 0) {
      return {
        status: images.length > 0 ? "running" : "submitted",
        progress: Math.floor((images.length / entries.length) * 100),
        images: [],
        raw,
      };
    }

    if (images.length === 0) {
      return {
        status: "failed",
        images: [],
        error: firstError ?? {
          category: "permanent",
          code: "flux_empty",
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

  async parseWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<{ providerJobId: string; event: PollResult } | null> {
    verifyFluxWebhook(headers, rawBody);

    let body: FluxWebhookBody;

    try {
      body = JSON.parse(rawBody) as FluxWebhookBody;
    } catch {
      return null;
    }

    if (typeof body.id !== "string" || !body.id) {
      return null;
    }

    // A single delivery is one variant. The route looks up the composite
    // job by this sub-id and then polls to reassemble the full result.
    const status =
      body.status === "Ready"
        ? "running"
        : body.status === "Error" || body.status === "Failed"
          ? "failed"
          : "running";

    return {
      providerJobId: body.id,
      event: {
        status,
        images: [],
        raw: body,
        ...(status === "failed"
          ? {
              error: {
                category: "permanent" as const,
                code: "flux_webhook_failed",
                message: `FLUX webhook reported failure for ${body.id}.`,
              },
            }
          : {}),
      },
    };
  }

  async cancel(): Promise<void> {
    // BFL has no cancel endpoint we rely on; expiry handles abandoned work.
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
