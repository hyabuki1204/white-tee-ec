/** Recommended use hints by fabric — shown on product cards. */
export const PRODUCT_USAGE_BY_FABRIC: Record<string, string> = {
  "heavyweight-jersey": "1枚着 · 春秋向き",
  "lightweight-jersey": "真夏 · インナー向き",
  "relaxed-jersey": "ゆったり · オーバーサイズ気味",
  "compact-jersey": "レイヤード · すっきり",
  "essential-jersey": "定番 · 年中使える",
  "box-jersey": "1枚着 · 存在感",
};

export function getProductUsageHint(
  fabricSlug: string | null | undefined,
): string | null {
  if (!fabricSlug) return null;
  return PRODUCT_USAGE_BY_FABRIC[fabricSlug] ?? null;
}
