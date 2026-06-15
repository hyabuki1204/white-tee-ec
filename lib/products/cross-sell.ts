import type { Product } from "@/types";

/** Other pieces in the same fabric, excluding items already in cart. */
export function getFabricCrossSellProducts(
  cartProductIds: string[],
  allProducts: Product[],
  limit = 3,
): Product[] {
  const inCart = new Set(cartProductIds);
  const fabricSlugs = new Set(
    allProducts
      .filter((product) => inCart.has(product.id) && product.fabricSlug)
      .map((product) => product.fabricSlug as string),
  );

  if (fabricSlugs.size === 0) {
    return [];
  }

  return allProducts
    .filter(
      (product) =>
        product.fabricSlug &&
        fabricSlugs.has(product.fabricSlug) &&
        !inCart.has(product.id),
    )
    .slice(0, limit);
}
