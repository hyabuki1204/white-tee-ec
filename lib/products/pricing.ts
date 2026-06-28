/**
 * Premium price ladder — ¥12,000–¥18,000 band, core at ¥15,000.
 * Keep in sync with product-catalog.ts and supabase migrations.
 */
export const PRODUCT_PRICE_BY_SLUG: Record<string, number> = {
  "compact-cotton-tee": 12_000,
  "lightweight-pocket-tee": 13_000,
  "compact-cotton-tee-long-sleeve": 13_500,
  "relaxed-fit-tee": 14_000,
  "lightweight-pocket-tee-long-sleeve": 14_500,
  "short-sleeve-essential": 14_500,
  "heavyweight-crew-neck": 15_000,
  "box-fit-tee": 15_000,
  "relaxed-fit-tee-long-sleeve": 15_500,
  "long-sleeve-essential": 16_500,
  "heavyweight-crew-neck-long-sleeve": 17_000,
  "box-fit-tee-long-sleeve": 18_000,
};

export const PRICE_LADDER = {
  min: 12_000,
  max: 18_000,
  core: 15_000,
  label: "¥12,000–¥18,000",
  coreLabel: "Core tees at ¥15,000",
} as const;

export function getCatalogPrice(slug: string, fallback: number): number {
  return PRODUCT_PRICE_BY_SLUG[slug] ?? fallback;
}
