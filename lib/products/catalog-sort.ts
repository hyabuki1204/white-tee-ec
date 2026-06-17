import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import type { Product } from "@/types";

const CATALOG_ORDER = new Map(
  PRODUCT_CATALOG.map((entry, index) => [entry.slug, index]),
);

/** Sort products in WT-001 … WT-012 catalog order (fabric × sleeve pairs). */
export function sortProductsByCatalogOrder(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aIndex = CATALOG_ORDER.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = CATALOG_ORDER.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}
