import "server-only";

import { notFound } from "next/navigation";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n/config";

export type LocaleParams = { locale: string };

/**
 * Read the `[locale]` segment in a page, layout or `generateMetadata`.
 * Anything other than a supported locale is a 404.
 */
export async function resolveLocale(
  params: Promise<LocaleParams>,
): Promise<Locale> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return locale;
}

export function localeStaticParams(): LocaleParams[] {
  return LOCALES.map((locale) => ({ locale }));
}
