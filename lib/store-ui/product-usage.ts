/** Recommended use hints by gauge — shown on product cards. */
export const PRODUCT_USAGE_BY_FABRIC: Record<string, string> = {
  "28g-jersey": "1枚で着る · 肉厚で透けにくい",
  "36g-jersey": "毎日の基準 · 一年を通して",
  "46g-jersey": "ジャケットの下に · 薄く、密",
};

export function getProductUsageHint(
  fabricSlug: string | null | undefined,
): string | null {
  if (!fabricSlug) return null;
  return PRODUCT_USAGE_BY_FABRIC[fabricSlug] ?? null;
}
