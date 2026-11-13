import type { Product } from "@/types";

function crossSellScore(product: Product, cartProducts: Product[]): number {
  if (!product.fabricSlug) {
    return 0;
  }

  // Same gauge, the other silhouette.
  const sameGaugeOtherFit = cartProducts.some(
    (cartProduct) =>
      cartProduct.fabricSlug === product.fabricSlug &&
      cartProduct.fitType !== product.fitType,
  );

  if (sameGaugeOtherFit) {
    return 2;
  }

  // Same silhouette, another gauge.
  const sameFitOtherGauge = cartProducts.some(
    (cartProduct) =>
      cartProduct.fitType === product.fitType &&
      cartProduct.fabricSlug !== product.fabricSlug,
  );

  return sameFitOtherGauge ? 1 : 0;
}

/** Complementary pieces: same gauge in the other silhouette, then same silhouette in another gauge. */
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
