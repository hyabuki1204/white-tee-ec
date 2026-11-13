import type { Locale } from "@/lib/i18n/config";

/**
 * Typed dictionary entry: Japanese and English copy side by side.
 *
 * The Japanese object defines the shape. The English object must match it
 * exactly, so a missing (or misspelt) key in either language is a type error.
 *
 *   const getCopy = defineCopy(
 *     { title: "カート", count: (n: number) => `${n}点` },
 *     { title: "Bag", count: (n: number) => `${n} items` },
 *   );
 *   getCopy(locale).title
 */
export function defineCopy<T>(ja: T, en: NoInfer<T>): (locale: Locale) => T {
  return (locale) => (locale === "en" ? en : ja);
}

/** A value that exists once per locale. */
export type Localized<T> = Record<Locale, T>;

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}
