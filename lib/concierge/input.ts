import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import type { ConciergeErrorCode, ConciergeTurn } from "@/lib/concierge/types";
import { isValidProductSlug } from "@/lib/products/defaults";

export type ParsedConciergeInput =
  | { ok: true; messages: ConciergeTurn[]; contextSlug: string | null }
  | { ok: false; error: ConciergeErrorCode };

function normalize(text: string): string {
  return text
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Validate and cap a request body.
 *
 * The conversation is held by the browser and replayed on each request, so
 * everything in it is untrusted, including the lines attributed to the
 * concierge. Over-long customer messages are rejected rather than truncated:
 * silently cutting what someone wrote would answer a different question.
 * History is trimmed from the oldest end to the kept-turn and character caps.
 */
export function parseConciergeInput(body: unknown): ParsedConciergeInput {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "invalid_request" };
  }

  const { messages, contextSlug } = body as Record<string, unknown>;

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > CONCIERGE_LIMITS.maxTurnsAccepted
  ) {
    return { ok: false, error: "invalid_request" };
  }

  const turns: ConciergeTurn[] = [];

  for (const item of messages) {
    if (typeof item !== "object" || item === null) {
      return { ok: false, error: "invalid_request" };
    }

    const { role, content } = item as Record<string, unknown>;

    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return { ok: false, error: "invalid_request" };
    }

    const text = normalize(content);

    if (role === "user") {
      if (!text) return { ok: false, error: "invalid_request" };
      if (text.length > CONCIERGE_LIMITS.maxMessageChars) {
        return { ok: false, error: "message_too_long" };
      }
      turns.push({ role, content: text });
    } else if (text) {
      turns.push({
        role,
        content: text.slice(0, CONCIERGE_LIMITS.maxAssistantChars),
      });
    }
  }

  if (turns[turns.length - 1]?.role !== "user") {
    return { ok: false, error: "invalid_request" };
  }

  let kept = turns.slice(-CONCIERGE_LIMITS.maxTurnsKept);
  let total = kept.reduce((sum, turn) => sum + turn.content.length, 0);

  while (kept.length > 1 && total > CONCIERGE_LIMITS.maxTotalChars) {
    total -= kept[0].content.length;
    kept = kept.slice(1);
  }

  // The Messages API needs the first turn to be the customer's.
  while (kept.length > 1 && kept[0].role !== "user") {
    kept = kept.slice(1);
  }

  const slug =
    typeof contextSlug === "string" &&
    contextSlug.length <= 80 &&
    isValidProductSlug(contextSlug)
      ? contextSlug
      : null;

  return { ok: true, messages: kept, contextSlug: slug };
}
