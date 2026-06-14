import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import type { Product } from "@/types";

const CATALOG_SLUG_ORDER = PRODUCT_CATALOG.map((entry) => entry.slug);

function isInStock(product: Product): boolean {
  return product.variants.some((variant) => variant.stockQuantity > 0);
}

function featuredSortKey(product: Product): number {
  const stockTier = isInStock(product) ? 0 : 1;
  const catalogIndex = CATALOG_SLUG_ORDER.indexOf(product.slug);
  const catalogTier = catalogIndex === -1 ? CATALOG_SLUG_ORDER.length : catalogIndex;

  return stockTier * 100 + catalogTier;
}

/** Home Selection — respects featuredProductSlugs when non-empty. */
export function pickFeaturedProducts(
  products: Product[],
  limit: number,
  featuredSlugs: string[] = [],
): Product[] {
  if (limit < 1) {
    return [];
  }

  if (featuredSlugs.length > 0) {
    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return featuredSlugs
      .map((slug) => bySlug.get(slug))
      .filter((product): product is Product => product != null)
      .slice(0, limit);
  }

  return [...products]
    .sort((a, b) => featuredSortKey(a) - featuredSortKey(b))
    .slice(0, limit);
}
