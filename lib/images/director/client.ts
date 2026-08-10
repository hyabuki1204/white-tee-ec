import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude client and per-stage model configuration.
 *
 * The three director stages have genuinely different jobs, so they get
 * different models and effort levels: stage 1 is creative and runs on Opus,
 * stages 2 and 3 are format-following and evaluative and run on Sonnet.
 * Splitting them also means a failed stage can be retried on its own, and
 * only the expensive stage pays Opus rates.
 *
 * See docs/image-generation-workflow.md §5.
 */

export const DIRECTOR_MODEL = "claude-opus-5";
export const PROMPT_ENGINEER_MODEL = "claude-sonnet-5";
export const QA_MODEL = "claude-sonnet-5";

/**
 * Server-side fallback for the director.
 *
 * Claude Opus 5 runs safety classifiers that can decline a request
 * outright, returning HTTP 200 with stop_reason "refusal". Benign work
 * occasionally trips them, so a declined request is re-run on the
 * recommended fallback inside the same call rather than surfacing as a
 * failure. "default" routes by refusal category, so there is no pinned
 * model to migrate when the recommendation changes.
 */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

/** Mirrors isSupabaseConfigured(): absent credentials disable the feature. */
export function isClaudeConfigured(): boolean {
  return Boolean(getAnthropicApiKey());
}

/**
 * The subset of the SDK the director uses.
 *
 * Narrowing it to this lets tests inject a stub without standing up an HTTP
 * mock, and keeps the director from quietly growing a dependency on more of
 * the SDK surface than it needs.
 */
export type ClaudeMessagesClient = {
  beta: {
    messages: {
      create: (
        params: Anthropic.Beta.Messages.MessageCreateParamsNonStreaming,
      ) => Promise<Anthropic.Beta.Messages.BetaMessage>;
    };
  };
};

let cachedClient: Anthropic | null = null;

export function getClaudeClient(): ClaudeMessagesClient {
  const apiKey = getAnthropicApiKey();

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Claude director stages are disabled.",
    );
  }

  cachedClient ??= new Anthropic({ apiKey });

  return cachedClient as unknown as ClaudeMessagesClient;
}

export class ClaudeRefusalError extends Error {
  readonly category: string | null;

  constructor(category: string | null, explanation?: string) {
    super(
      `Claude declined this request${category ? ` (${category})` : ""}.` +
        (explanation ? ` ${explanation}` : ""),
    );
    this.name = "ClaudeRefusalError";
    this.category = category;
  }
}

export class ClaudeOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeOutputError";
  }
}

/**
 * Pull the structured payload out of a response.
 *
 * Checks stop_reason before touching content: on a refusal the content
 * array is empty or partial, so indexing into it blindly is how a refusal
 * turns into a confusing crash somewhere else.
 */
export function extractStructuredOutput<T>(
  message: Anthropic.Beta.Messages.BetaMessage,
): T {
  if (message.stop_reason === "refusal") {
    const details = message.stop_details as
      | { category?: string | null; explanation?: string }
      | null
      | undefined;

    throw new ClaudeRefusalError(
      details?.category ?? null,
      details?.explanation,
    );
  }

  if (message.stop_reason === "max_tokens") {
    throw new ClaudeOutputError(
      "Claude hit max_tokens before finishing. Raise max_tokens and retry.",
    );
  }

  const text = message.content
    .filter(
      (block): block is Anthropic.Beta.Messages.BetaTextBlock =>
        block.type === "text",
    )
    .map((block) => block.text)
    .join("");

  if (!text.trim()) {
    throw new ClaudeOutputError("Claude returned no text content.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ClaudeOutputError(
      `Claude returned text that is not valid JSON: ${text.slice(0, 200)}`,
    );
  }
}

export type ClaudeUsage = {
  inputTokens: number;
  outputTokens: number;
};

export function extractUsage(
  message: Anthropic.Beta.Messages.BetaMessage,
): ClaudeUsage {
  return {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}
