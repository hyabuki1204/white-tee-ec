/**
 * Storefront locales. Japanese is the default and lives at unprefixed URLs
 * (`/products`); English lives under `/en` (`/en/products`).
 */
export const LOCALES = ["ja", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en";
}

/** Open Graph locale tags. */
export const OG_LOCALE: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_GB",
};

/** Short labels for the language switch. */
export const LOCALE_SWITCH_LABEL: Record<Locale, string> = {
  ja: "JP",
  en: "EN",
};
