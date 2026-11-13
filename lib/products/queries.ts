import "server-only";

/**
 * Server-side product queries.
 * Pages and Server Components should import from here.
 */
export {
  getAllProductSlugs,
  getProductById,
  getProductBySlug,
  getProductLookupMap,
  getProducts,
  getProductsWithStock,
  getProductsByIds,
} from "@/lib/db/products/repository";
