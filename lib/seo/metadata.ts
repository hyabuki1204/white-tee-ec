import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALE,
  type Locale,
} from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/paths";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";

export const DEFAULT_OGP_IMAGE_PATH = "/home/hero-46g.jpg";

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Absolute URL of a storefront path in a locale (`/en` prefix for English). */
export function localizedUrl(path: string, locale: Locale): string {
  return absoluteUrl(localizePath(path, locale));
}

/** hreflang map for a path: ja, en and x-default (Japanese). */
export function languageAlternates(
  path: string,
  locales: readonly Locale[] = LOCALES,
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = localizedUrl(path, locale);
  }

  if (locales.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = localizedUrl(path, DEFAULT_LOCALE);
  }

  return languages;
}

export function resolveImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return absoluteUrl(imagePath);
}

type BuildPageMetadataOptions = {
  title: string;
  description?: string;
  /** Locale-free path, e.g. `/products`. */
  path?: string;
  /** Locale of this rendering. Sets canonical, og:locale and hreflang. */
  locale: Locale;
  /** Locales in which this page exists. Defaults to all. */
  availableLocales?: readonly Locale[];
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
};

function formatTitle(title: string): string {
  if (title === SITE_NAME || title.endsWith(`| ${SITE_NAME}`)) {
    return title;
  }
  return `${title} | ${SITE_NAME}`;
}

/** Consistent page metadata with OGP, Twitter card, canonical URL and hreflang. */
export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  locale,
  availableLocales = LOCALES,
  image,
  type = "website",
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const fullTitle = formatTitle(title);
  const url = localizedUrl(path, locale);
  const ogImage = resolveImageUrl(image ?? DEFAULT_OGP_IMAGE_PATH);
  const otherLocales = availableLocales.filter((entry) => entry !== locale);

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path, availableLocales),
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      ...(otherLocales.length > 0
        ? { alternateLocale: otherLocales.map((entry) => OG_LOCALE[entry]) }
        : {}),
      type,
      images: [{ url: ogImage, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
