import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecretFromEnv,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
