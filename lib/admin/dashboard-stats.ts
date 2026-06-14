import "server-only";

import { mapOrderRowToAdminListItem } from "@/lib/db/orders/mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminOrderListItem } from "@/types/admin-order";

export type LowStockProduct = {
  id: string;
  name: string;
  totalStock: number;
};

export type DashboardStats = {
  unshippedCount: number;
  lowStockProducts: LowStockProduct[];
  recentOrders: AdminOrderListItem[];
};

const EMPTY_STATS: DashboardStats = {
  unshippedCount: 0,
  lowStockProducts: [],
  recentOrders: [],
};

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    return EMPTY_STATS;
  }

  const supabase = createSupabaseAdminClient();

  const [
    { count: unshippedCount, error: unshippedError },
    { data: lowStockVariants, error: lowStockError },
    { data: recentOrders, error: recentError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("product_variants")
      .select("product_id, stock_quantity")
      .lte("stock_quantity", 2),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (unshippedError) {
    throw new Error(`Failed to count unshipped orders: ${unshippedError.message}`);
  }

  if (lowStockError) {
    throw new Error(`Failed to fetch low stock: ${lowStockError.message}`);
  }

  if (recentError) {
    throw new Error(`Failed to fetch recent orders: ${recentError.message}`);
  }

  const stockByProduct = new Map<string, number>();

  for (const row of lowStockVariants ?? []) {
    stockByProduct.set(
      row.product_id,
      (stockByProduct.get(row.product_id) ?? 0) + row.stock_quantity,
    );
  }

  const lowStockProductIds = [...stockByProduct.entries()]
    .filter(([, totalStock]) => totalStock <= 2)
    .map(([productId]) => productId);

  let lowStockProducts: LowStockProduct[] = [];

  if (lowStockProductIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", lowStockProductIds);

    if (productsError) {
      throw new Error(`Failed to fetch product names: ${productsError.message}`);
    }

    lowStockProducts = (products ?? [])
      .map((product) => ({
        id: product.id,
        name: product.name,
        totalStock: stockByProduct.get(product.id) ?? 0,
      }))
      .sort((a, b) => a.totalStock - b.totalStock);
  }

  return {
    unshippedCount: unshippedCount ?? 0,
    lowStockProducts,
    recentOrders: (recentOrders ?? []).map(mapOrderRowToAdminListItem),
  };
}
