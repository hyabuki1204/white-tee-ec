import "server-only";

import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { isFitType, isSleeveType } from "@/lib/products/silhouette";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ProductSize } from "@/types";
import type { RestockLocale } from "@/types/database";

/**
 * restock_requests access. Service role only — the table has RLS enabled
 * with no policies, so nothing here may be imported from a Client Component.
 */

const SIZE_ORDER: ProductSize[] = ["S", "M", "L", "XL"];

/** How many pending rows one read looks at. Counts above this are truncated. */
export const PENDING_READ_LIMIT = 5000;

export type VariantAvailability =
  | { found: false }
  | { found: true; stockQuantity: number };

/** Live stock for one size of a published product. */
export async function getVariantAvailability(
  productId: string,
  size: ProductSize,
): Promise<VariantAvailability> {
  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, is_published")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new Error(`Failed to fetch product: ${productError.message}`);
  }

  if (!product || !product.is_published) {
    return { found: false };
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("stock_quantity")
    .eq("product_id", productId)
    .eq("size", size)
    .maybeSingle();

  if (variantError) {
    throw new Error(`Failed to fetch variant: ${variantError.message}`);
  }

  return variant
    ? { found: true, stockQuantity: variant.stock_quantity }
    : { found: false };
}

/**
 * Insert a pending request. A second request for the same address and
 * variant hits the partial unique index and is treated as success, so the
 * caller cannot tell (and cannot leak) whether the address was known.
 */
export async function insertRestockRequest(input: {
  email: string;
  productId: string;
  size: ProductSize;
  locale: RestockLocale;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("restock_requests").insert({
    email: input.email,
    product_id: input.productId,
    size: input.size,
    locale: input.locale,
  });

  // 23505 = unique_violation: already pending.
  if (error && error.code !== "23505") {
    throw new Error(`Failed to store restock request: ${error.message}`);
  }
}

export type PendingRestockRequest = {
  id: string;
  email: string;
  productId: string;
  size: ProductSize;
  locale: RestockLocale;
  createdAt: string;
};

export type RestockProductInfo = {
  id: string;
  slug: string;
  /** Gauge-first name, e.g. "46G Regular Tee". */
  displayName: string;
  isPublished: boolean;
  stockBySize: Partial<Record<ProductSize, number>>;
};

async function listPendingRequests(
  productId?: string,
): Promise<PendingRestockRequest[]> {
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("restock_requests")
    .select("id, email, product_id, size, locale, created_at")
    .is("notified_at", null)
    .order("created_at", { ascending: true })
    .limit(PENDING_READ_LIMIT);

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to read restock requests: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    productId: row.product_id,
    size: row.size as ProductSize,
    locale: row.locale,
    createdAt: row.created_at,
  }));
}

async function getProductInfo(
  productIds: string[],
): Promise<Map<string, RestockProductInfo>> {
  if (productIds.length === 0) return new Map();

  const supabase = createSupabaseAdminClient();

  const [products, variants] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, fabric_slug, fit_type, sleeve_type, is_published")
      .in("id", productIds),
    supabase
      .from("product_variants")
      .select("product_id, size, stock_quantity")
      .in("product_id", productIds),
  ]);

  if (products.error) {
    throw new Error(`Failed to fetch products: ${products.error.message}`);
  }

  if (variants.error) {
    throw new Error(`Failed to fetch variants: ${variants.error.message}`);
  }

  const info = new Map<string, RestockProductInfo>(
    (products.data ?? []).map((row) => [
      row.id,
      {
        id: row.id,
        slug: row.slug,
        displayName: getGraphpaperDisplayName({
          name: row.name,
          fabricSlug: row.fabric_slug,
          fitType: isFitType(row.fit_type) ? row.fit_type : "regular",
          sleeveType: isSleeveType(row.sleeve_type) ? row.sleeve_type : "short",
        }),
        isPublished: row.is_published,
        stockBySize: {},
      },
    ]),
  );

  for (const variant of variants.data ?? []) {
    const entry = info.get(variant.product_id);
    if (entry) {
      entry.stockBySize[variant.size as ProductSize] = variant.stock_quantity;
    }
  }

  return info;
}

/** Pending requests with the product state needed to decide and to write. */
export async function getPendingRestockRequests(productId?: string): Promise<{
  requests: PendingRestockRequest[];
  products: Map<string, RestockProductInfo>;
}> {
  const requests = await listPendingRequests(productId);
  const products = await getProductInfo([
    ...new Set(requests.map((request) => request.productId)),
  ]);

  return { requests, products };
}

/**
 * Record a delivered notice. Guarded on notified_at so two overlapping
 * dispatches cannot both claim the row.
 */
export async function markRestockRequestNotified(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("restock_requests")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id)
    .is("notified_at", null);

  if (error) {
    throw new Error(`Failed to mark restock request: ${error.message}`);
  }
}

export type PendingRestockGroup = {
  productId: string;
  productName: string;
  productSlug: string | null;
  isPublished: boolean;
  size: ProductSize;
  count: number;
  oldestRequestAt: string;
  /** Null when the size is no longer offered. */
  stockQuantity: number | null;
};

/** Admin view: pending requests per product and size. No addresses. */
export async function listPendingRestockGroups(): Promise<{
  groups: PendingRestockGroup[];
  total: number;
  truncated: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { groups: [], total: 0, truncated: false };
  }

  const { requests, products } = await getPendingRestockRequests();
  const groups = new Map<string, PendingRestockGroup>();

  for (const request of requests) {
    const key = `${request.productId}:${request.size}`;
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    const product = products.get(request.productId);

    groups.set(key, {
      productId: request.productId,
      productName: product?.displayName ?? request.productId,
      productSlug: product?.slug ?? null,
      isPublished: product?.isPublished ?? false,
      size: request.size,
      count: 1,
      // Rows arrive oldest first, so the first one seen is the oldest.
      oldestRequestAt: request.createdAt,
      stockQuantity: product?.stockBySize[request.size] ?? null,
    });
  }

  return {
    groups: [...groups.values()].sort(
      (a, b) =>
        a.productName.localeCompare(b.productName, "en", { numeric: true }) ||
        SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size),
    ),
    total: requests.length,
    truncated: requests.length >= PENDING_READ_LIMIT,
  };
}
