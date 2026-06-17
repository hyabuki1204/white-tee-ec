import type { Product } from "@/types";

function crossSellScore(product: Product, cartProducts: Product[]): number {
  if (!product.fabricSlug) {
    return 0;
  }

  const sameFabricCart = cartProducts.filter(
    (cartProduct) => cartProduct.fabricSlug === product.fabricSlug,
  );

  if (sameFabricCart.length === 0) {
    return 0;
  }

  const oppositeSleeve = sameFabricCart.some(
    (cartProduct) => cartProduct.sleeveType !== product.sleeveType,
  );

  if (oppositeSleeve) {
    return 2;
  }

  const sameSleeveDifferentFit = sameFabricCart.some(
    (cartProduct) =>
      cartProduct.sleeveType === product.sleeveType &&
      cartProduct.fitType !== product.fitType,
  );

  return sameSleeveDifferentFit ? 1 : 0;
}

/** Complementary pieces: same fabric with opposite sleeve, or same sleeve different fit. */
export function getFabricCrossSellProducts(
  cartProductIds: string[],
  allProducts: Product[],
  limit = 3,
): Product[] {
  const inCart = new Set(cartProductIds);
  const cartProducts = allProducts.filter((product) => inCart.has(product.id));

  if (cartProducts.length === 0) {
    return [];
  }

  const candidates = allProducts.filter(
    (product) => product.fabricSlug && !inCart.has(product.id),
  );

  return candidates
    .map((product) => ({
      product,
      score: crossSellScore(product, cartProducts),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.product)
    .slice(0, limit);
}
