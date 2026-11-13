import type { Currency, FxRates } from "@/lib/currency/config";

const SYMBOL: Record<Currency, string> = {
  USD: "US$",
  EUR: "€",
  GBP: "£",
};

/** Yen amount converted and rounded to a whole unit of the target currency. */
export function convertFromJpy(
  amountJpy: number,
  currency: Currency,
  fx: FxRates,
): number {
  return Math.round(amountJpy * fx.perJpy[currency]);
}

/** "US$117", "€108", "£92" — whole units, no decimals: it is an estimate. */
export function formatForeign(amount: number, currency: Currency): string {
  return `${SYMBOL[currency]}${amount.toLocaleString("en-GB")}`;
}

/** "approx. US$117" */
export function formatApprox(
  amountJpy: number,
  currency: Currency,
  fx: FxRates,
): string {
  return `approx. ${formatForeign(convertFromJpy(amountJpy, currency, fx), currency)}`;
}

/** "¥18,000 (approx. US$117)" — yen first, always. */
export function formatPriceWithApprox(
  amountJpy: number,
  currency: Currency,
  fx: FxRates,
): string {
  return `¥${amountJpy.toLocaleString("ja-JP")} (${formatApprox(amountJpy, currency, fx)})`;
}
