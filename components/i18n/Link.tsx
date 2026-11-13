"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/paths";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href" | "locale"> & {
  href: string;
  /** Link into a specific locale instead of the current one. */
  locale?: Locale;
};

/**
 * Storefront link. Internal hrefs are written without a locale
 * (`/products`) and resolve to the visitor's locale (`/en/products`).
 * External URLs and `#anchors` pass through untouched.
 */
export function Link({ href, locale, ...props }: LinkProps) {
  const current = useLocale();
  return <NextLink href={localizePath(href, locale ?? current)} {...props} />;
}
