import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";

/** Catalog-wide price span, e.g. "¥6,500 – ¥9,800（全12モデル）". */
export function formatCatalogPriceRange(
  products: Product[],
  modelCount?: number,
): string {
  if (products.length === 0) {
    return "";
  }

  const prices = products.map((product) => product.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const count = modelCount ?? products.length;

  if (min === max) {
    return `${formatPrice(min)}（全${count}モデル）`;
  }

  return `${formatPrice(min)} – ${formatPrice(max)}（全${count}モデル）`;
}

export function getCatalogPriceBounds(products: Product[]): {
  min: number;
  max: number;
} {
  const prices = products.map((product) => product.price);

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
