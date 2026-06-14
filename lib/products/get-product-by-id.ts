import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import type { Product } from "@/types";

/**
 * Sync product lookup for Client Components (e.g. cart item labels).
 * Uses mock data until cart persistence moves to Supabase.
 */
export function getProductById(id: string): Product | null {
  return MOCK_PRODUCTS.find((product) => product.id === id) ?? null;
}
