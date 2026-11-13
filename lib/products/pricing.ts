/**
 * Provisional price ladder by gauge. Regular and Box share a price per fabric.
 * Keep in sync with product-catalog.ts, scripts/apply-premium-pricing.mjs and supabase migrations.
 */
export const PRODUCT_PRICE_BY_SLUG: Record<string, number> = {
  "28g-regular-tee": 16_000,
  "28g-box-tee": 16_000,
  "36g-regular-tee": 15_000,
  "36g-box-tee": 15_000,
  "46g-regular-tee": 18_000,
  "46g-box-tee": 18_000,
};

export const PRICE_LADDER = {
  min: 15_000,
  max: 18_000,
  core: 15_000,
  /** Catalog range only — never pair with a separate “core tee” line. */
  label: "¥15,000 – ¥18,000",
} as const;

export function getCatalogPrice(slug: string, fallback: number): number {
  return PRODUCT_PRICE_BY_SLUG[slug] ?? fallback;
}
