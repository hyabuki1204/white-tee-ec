/** Formats a number as Japanese yen (e.g. 8800 → "¥8,800"). */
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}
