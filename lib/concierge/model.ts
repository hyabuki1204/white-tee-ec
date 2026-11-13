import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { ConciergeCatalog } from "@/lib/concierge/catalog";
import { validateModelOutput } from "@/lib/concierge/finalize";
import { CONCIERGE_LIMITS, DEFAULT_CONCIERGE_MODEL } from "@/lib/concierge/limits";
import {
  buildDynamicSystemPrompt,
  buildOutputSchema,
  buildStaticSystemPrompt,
} from "@/lib/concierge/prompt";
import type {
  ConciergeLanguage,
  ConciergeTurn,
  RawConciergeResult,
} from "@/lib/concierge/types";
import { getAnthropicApiKey } from "@/lib/images/director/client";

/**
 * The model path: one Messages API call with structured output.
 *
 * Not streamed. The reply cannot be shown until the server has validated
 * the recommendation against the catalog and current stock — a sold-out
 * pick rewrites the reply — so there is nothing safe to stream early, and
 * the whole answer is a few hundred tokens.
 *
 * Every failure mode returns { ok: false } and the caller answers from the
 * rules path instead; nothing here throws to the route.
 */

export function getConciergeModel(): string {
  return process.env.CONCIERGE_MODEL?.trim() || DEFAULT_CONCIERGE_MODEL;
}

/** The subset of the SDK this module uses, so tests can inject a stub. */
export type ConciergeMessagesClient = {
  messages: {
    create: (
      params: Anthropic.MessageCreateParamsNonStreaming,
      options?: { timeout?: number; maxRetries?: number },
    ) => Promise<Anthropic.Message>;
  };
};

let cachedClient: Anthropic | null = null;

export function getConciergeClient(): ConciergeMessagesClient | null {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) return null;

  cachedClient ??= new Anthropic({ apiKey });

  return cachedClient;
}

export type ModelFailure =
  | "refusal"
  | "truncated"
  | "invalid_output"
  | "auth"
  | "rate_limited"
  | "bad_request"
  | "timeout"
  | "api_error"
  | "unknown";

export type ModelOutcome =
  | { ok: true; result: RawConciergeResult }
  | { ok: false; reason: ModelFailure };

function classifyError(error: unknown): ModelFailure {
  if (error instanceof Anthropic.AuthenticationError) return "auth";
  if (error instanceof Anthropic.PermissionDeniedError) return "auth";
  if (error instanceof Anthropic.RateLimitError) return "rate_limited";
  if (error instanceof Anthropic.BadRequestError) return "bad_request";
  if (error instanceof Anthropic.APIConnectionTimeoutError) return "timeout";
  if (error instanceof Anthropic.APIError) return "api_error";
  return "unknown";
}

export async function askModel(input: {
  client: ConciergeMessagesClient;
  catalog: ConciergeCatalog;
  messages: ConciergeTurn[];
  contextSlug: string | null;
  /** Storefront language the customer is browsing in. */
  locale?: ConciergeLanguage;
}): Promise<ModelOutcome> {
  const { client, catalog, messages, contextSlug, locale = "ja" } = input;

  try {
    const response = await client.messages.create(
      {
        model: getConciergeModel(),
        max_tokens: CONCIERGE_LIMITS.maxOutputTokens,
        // Low effort: this is a lookup against a small table, and thinking
        // tokens are billed as output and count against max_tokens.
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: buildOutputSchema(catalog) },
        },
        system: [
          {
            type: "text",
            text: buildStaticSystemPrompt(catalog),
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: buildDynamicSystemPrompt(catalog, contextSlug, locale),
          },
        ],
        messages: messages.map((turn) => ({
          role: turn.role,
          content: turn.content,
        })),
      },
      // One retry at most: the customer is waiting, and the rules path is
      // an acceptable answer.
      { timeout: CONCIERGE_LIMITS.modelTimeoutMs, maxRetries: 1 },
    );

    // Token counts only — never message content.
    console.info("concierge: model usage", {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
      stop: response.stop_reason,
    });

    // Check stop_reason before content: on a refusal or a cut-off the JSON
    // is absent or partial.
    if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };
    if (response.stop_reason === "max_tokens") {
      return { ok: false, reason: "truncated" };
    }

    // Thinking is on by default on current models, so the answer is not
    // necessarily the first block. Select by type.
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, reason: "invalid_output" };
    }

    const result = validateModelOutput(parsed, catalog);

    return result ? { ok: true, result } : { ok: false, reason: "invalid_output" };
  } catch (error) {
    const reason = classifyError(error);

    // Status and class only. API error messages can echo request content.
    console.error("concierge: model call failed", {
      reason,
      status: error instanceof Anthropic.APIError ? error.status : undefined,
    });

    return { ok: false, reason };
  }
}
