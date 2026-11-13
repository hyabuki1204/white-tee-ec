import { buildCatalog, type ConciergeCatalog } from "@/lib/concierge/catalog";
import { finalizeResult } from "@/lib/concierge/finalize";
import { recommendByRules } from "@/lib/concierge/rules";
import type { ConciergeReply, ConciergeTurn } from "@/lib/concierge/types";
import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import type { Product, ProductSize } from "@/types";

/** Mock catalog with chosen sizes set to a given stock level. */
export function productsWithStock(
  overrides: Record<string, Partial<Record<ProductSize, number>>> = {},
): Product[] {
  return MOCK_PRODUCTS.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      stockQuantity:
        overrides[product.slug]?.[variant.size] ?? variant.stockQuantity,
    })),
  }));
}

export function catalogWithStock(
  overrides: Record<string, Partial<Record<ProductSize, number>>> = {},
): ConciergeCatalog {
  return buildCatalog(productsWithStock(overrides));
}

export function user(...lines: string[]): ConciergeTurn[] {
  return lines.map((content) => ({ role: "user" as const, content }));
}

/** Rules path end to end: recommend, then stock policy and catalog join. */
export function ask(
  lines: string[],
  options: {
    catalog?: ConciergeCatalog;
    contextSlug?: string | null;
  } = {},
): ConciergeReply & { language: "ja" | "en" } {
  const catalog = options.catalog ?? catalogWithStock();
  const outcome = recommendByRules({
    messages: user(...lines),
    catalog,
    contextSlug: options.contextSlug ?? null,
  });

  return {
    ...finalizeResult(outcome.result, catalog, outcome.language, outcome.links),
    language: outcome.language,
  };
}

/** Every string a customer would read in a reply. */
export function allText(reply: ConciergeReply): string {
  return [
    reply.reply,
    reply.primary?.reason,
    reply.alternative?.reason,
    reply.followUpQuestion,
    ...reply.links.map((link) => link.label),
  ]
    .filter(Boolean)
    .join("\n");
}
