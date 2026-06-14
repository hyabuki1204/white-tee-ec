import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";

export const DEFAULT_OGP_IMAGE_PATH = "/home/hero.svg";

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
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
  path?: string;
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

/** Consistent page metadata with OGP, Twitter card, and canonical URL. */
export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
  type = "website",
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const fullTitle = formatTitle(title);
  const url = absoluteUrl(path);
  const ogImage = resolveImageUrl(image ?? DEFAULT_OGP_IMAGE_PATH);

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ja_JP",
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
