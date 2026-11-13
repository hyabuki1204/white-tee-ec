import "server-only";

import { createDailyCounter } from "@/lib/concierge/daily-counter";
import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Hard daily ceiling on paid model calls.
 *
 * Only calls that reach the model are counted; answers from the rules path
 * cost nothing and are not. With Supabase configured the count is shared by
 * every server instance through one atomic statement
 * (consume_concierge_budget, see supabase/migrations/add-concierge-usage.sql).
 * Without it, or if that call fails, a per-process counter takes over so the
 * ceiling degrades rather than disappears.
 */

const memoryCounter = createDailyCounter();

export function getConciergeDailyLimit(): number {
  const raw = process.env.CONCIERGE_DAILY_LIMIT;
  if (raw === undefined || raw.trim() === "") {
    return CONCIERGE_LIMITS.defaultDailyLimit;
  }

  const parsed = Number(raw);

  // 0 is a valid setting: it turns the model path off without removing the key.
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.floor(parsed)
    : CONCIERGE_LIMITS.defaultDailyLimit;
}

function isBudgetStoreConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

/** True if one more model call may be made today; counts it if so. */
export async function consumeConciergeBudget(): Promise<boolean> {
  const limit = getConciergeDailyLimit();
  if (limit < 1) return false;

  if (isBudgetStoreConfigured()) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.rpc("consume_concierge_budget", {
        p_limit: limit,
      });

      if (!error && typeof data === "boolean") {
        // Mirror into memory so a later store outage starts from a sane count.
        if (data) memoryCounter.tryConsume(limit);
        return data;
      }

      console.error("concierge: budget store error", error?.code ?? "no_data");
    } catch (error) {
      console.error(
        "concierge: budget store unavailable",
        error instanceof Error ? error.name : "unknown",
      );
    }
  }

  return memoryCounter.tryConsume(limit);
}
