import "server-only";

import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminPasswordFromEnv,
  getAdminSessionCookieOptions,
  getSessionSecretFromEnv,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";

export {
  ADMIN_SESSION_COOKIE,
  getAdminSessionCookieOptions,
} from "@/lib/admin/session-token";

export function getAdminPassword(): string | undefined {
  return getAdminPasswordFromEnv();
}

function requireSessionSecret(): string {
  const secret = getSessionSecretFromEnv();

  if (!secret) {
    throw new Error(
      "Admin session secret is not configured. Set ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return secret;
}

export async function issueAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = await createAdminSessionToken(requireSessionSecret());

  cookieStore.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getSessionSecretFromEnv();

  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  return verifyAdminSessionToken(token, secret);
}

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new AdminAuthError();
  }
}
