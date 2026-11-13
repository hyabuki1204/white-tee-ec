import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";

/** Paths that are never localised. */
const UNLOCALIZED_PREFIXES = ["/api", "/admin", "/_next"] as const;

function isUnlocalized(pathname: string): boolean {
  return (
    UNLOCALIZED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || /\.[a-z0-9]+$/i.test(pathname)
  );
}

function splitHref(href: string): { pathname: string; rest: string } {
  const index = href.search(/[?#]/);
  return index === -1
    ? { pathname: href, rest: "" }
    : { pathname: href.slice(0, index), rest: href.slice(index) };
}

/**
 * Split a pathname into its locale and the locale-free path.
 * `/en/products` → { locale: "en", pathname: "/products" };
 * `/products` → { locale: "ja", pathname: "/products" }.
 */
export function stripLocale(pathname: string): {
  locale: Locale;
  pathname: string;
} {
  const [, first, ...rest] = pathname.split("/");

  if (isLocale(first)) {
    return { locale: first, pathname: `/${rest.join("/")}` };
  }

  return { locale: DEFAULT_LOCALE, pathname: pathname || "/" };
}

/**
 * Internal href for a locale. Japanese has no prefix, English gets `/en`.
 * External URLs, in-page anchors, `/api`, `/admin` and file paths pass through.
 * Query string and hash are preserved.
 */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }

  const { pathname, rest } = splitHref(href);

  if (isUnlocalized(pathname)) {
    return href;
  }

  const bare = stripLocale(pathname).pathname;

  if (locale === DEFAULT_LOCALE) {
    return `${bare}${rest}`;
  }

  return `/${locale}${bare === "/" ? "" : bare}${rest}`;
}

/** The same page in another locale, keeping the query string. */
export function switchLocalePath(
  pathname: string,
  search: string,
  target: Locale,
): string {
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return localizePath(`${stripLocale(pathname).pathname}${query}`, target);
}
