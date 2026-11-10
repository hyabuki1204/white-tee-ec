import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { NewsletterSource } from "@/types/database";

const MAX_EMAIL_LENGTH = 254;
// Pragmatic check — the browser's type="email" does the first pass.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "invalid_email" | "unavailable" };

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(email)) return null;

  return email;
}

export function normalizeSource(value: unknown): NewsletterSource {
  return value === "footer" ? "footer" : "home";
}

/**
 * Store (or re-activate) a newsletter sign-up.
 * The result never reveals whether the address was already registered.
 */
export async function subscribeToNewsletter(
  rawEmail: unknown,
  rawSource: unknown,
): Promise<SubscribeResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) return { ok: false, reason: "invalid_email" };

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, source: normalizeSource(rawSource), unsubscribed_at: null },
        { onConflict: "email" },
      );

    if (error) {
      console.error("newsletter: insert failed", error.code, error.message);
      return { ok: false, reason: "unavailable" };
    }

    return { ok: true };
  } catch (error) {
    console.error(
      "newsletter: unavailable",
      error instanceof Error ? error.message : error,
    );
    return { ok: false, reason: "unavailable" };
  }
}
