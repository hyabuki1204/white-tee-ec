import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CreateOrderItemInput } from "@/types/order";

/**
 * Atomically decrement variant stock via Postgres RPC.
 * Requires migration: supabase/migrations/decrement-stock-and-rls.sql
 */
export async function decrementStockForOrderItems(
  items: CreateOrderItemInput[],
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  for (const item of items) {
    const { error } = await supabase.rpc("decrement_variant_stock", {
      p_product_id: item.productId,
      p_size: item.variant,
      p_quantity: item.quantity,
    });

    if (error) {
      throw new Error(
        `Failed to decrement stock for ${item.productId} (${item.variant}): ${error.message}`,
      );
    }
  }
}
