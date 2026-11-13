import "server-only";

import { consumeConciergeBudget } from "@/lib/concierge/budget";
import { buildCatalog } from "@/lib/concierge/catalog";
import { finalizeResult } from "@/lib/concierge/finalize";
import {
  askModel,
  getConciergeClient,
  type ConciergeMessagesClient,
} from "@/lib/concierge/model";
import { recommendByRules } from "@/lib/concierge/rules";
import { detectLanguage } from "@/lib/concierge/signals";
import type {
  ConciergeSuccessResponse,
  ConciergeTurn,
} from "@/lib/concierge/types";
import type { Product } from "@/types";

export type AnswerDependencies = {
  /** Null means "no API key": the model path is skipped without spending budget. */
  getClient: () => ConciergeMessagesClient | null;
  consumeBudget: () => Promise<boolean>;
};

const defaultDependencies: AnswerDependencies = {
  getClient: getConciergeClient,
  consumeBudget: consumeConciergeBudget,
};

/**
 * Answer one concierge request.
 *
 * Model path when a key is configured and today's budget allows it; rules
 * path otherwise and on any model failure. Both produce the same shape and
 * both pass through finalizeResult(), so catalog and stock guarantees do
 * not depend on which one answered.
 */
export async function answerConcierge(
  input: {
    messages: ConciergeTurn[];
    contextSlug: string | null;
    products: Product[];
  },
  dependencies: AnswerDependencies = defaultDependencies,
): Promise<ConciergeSuccessResponse> {
  const catalog = buildCatalog(input.products);
  const contextSlug =
    input.contextSlug && catalog.bySlug.has(input.contextSlug)
      ? input.contextSlug
      : null;

  const client = catalog.entries.length > 0 ? dependencies.getClient() : null;

  // Budget is consumed only when a call will actually be made.
  if (client && (await dependencies.consumeBudget())) {
    const outcome = await askModel({
      client,
      catalog,
      messages: input.messages,
      contextSlug,
    });

    if (outcome.ok) {
      return {
        ok: true,
        ...finalizeResult(
          outcome.result,
          catalog,
          detectLanguage(outcome.result.reply),
        ),
        source: "model",
      };
    }
  }

  const rules = recommendByRules({
    messages: input.messages,
    catalog,
    contextSlug,
  });

  return {
    ok: true,
    ...finalizeResult(rules.result, catalog, rules.language, rules.links),
    source: "rules",
  };
}
