import { defineCopy } from "@/lib/i18n/define-copy";

/**
 * Notes about indicative currency conversion. Only the English storefront
 * shows converted amounts, so the Japanese strings are never rendered; they
 * exist so the dictionary stays complete in both languages.
 */
export const getCurrencyCopy = defineCopy(
  {
    chargedInYen: "お支払いは日本円です。換算額は目安です。",
    estimatesIn: "換算通貨",
    switchLabel: "換算額の表示通貨",
    ratesAsOf: (date: string) => `換算レートは ${date} 時点のものです。`,
  },
  {
    chargedInYen: "Charged in Japanese yen. Converted amounts are estimates.",
    estimatesIn: "Estimates in",
    switchLabel: "Display currency for estimates",
    ratesAsOf: (date: string) => `Estimate rates set on ${date}.`,
  },
);
