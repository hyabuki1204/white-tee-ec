import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecretFromEnv,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_ADMIN_API_PATHS = ["/api/admin/login"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isPublicAdminApiPath(pathname: string): boolean {
  return PUBLIC_ADMIN_API_PATHS.some((path) => pathname === path);
}

function isUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

async function adminAuth(request: NextRequest, pathname: string) {
  const isAdminPage = isUnder(pathname, "/admin");
  const isAdminApi = isUnder(pathname, "/api/admin");

  if (isAdminPage && isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (isAdminApi && isPublicAdminApiPath(pathname)) {
    return NextResponse.next();
  }

  const secret = getSessionSecretFromEnv();
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated =
    Boolean(secret && token) &&
    (await verifyAdminSessionToken(token!, secret!));

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

/**
 * Storefront locale routing.
 *
 * Pages live under `app/[locale]`. English is addressed as `/en/...`.
 * Japanese keeps its unprefixed URLs: `/products` is rewritten (not
 * redirected) to `/ja/products`, and a literal `/ja/...` is redirected to the
 * unprefixed address so each page has one URL.
 *
 * There is no `Accept-Language` redirect: the locale comes from the URL only.
 */
function localeRouting(request: NextRequest, pathname: string) {
  const first = pathname.split("/")[1];

  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUnder(pathname, "/admin") || isUnder(pathname, "/api/admin")) {
    return adminAuth(request, pathname);
  }

  if (isUnder(pathname, "/api")) {
    return NextResponse.next();
  }

  return localeRouting(request, pathname);
}

export const config = {
  matcher: [
    // Admin pages and admin API: session check.
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    // Storefront pages: locale routing. Skips the rest of /api, Next
    // internals, and anything with a file extension (public assets,
    // sitemap.xml, robots.txt, build-id.txt).
    "/((?!api/|api$|admin/|admin$|_next/|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
