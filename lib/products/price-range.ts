import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";

/** Price span only, e.g. "¥12,000 – ¥18,000". */
export function formatCatalogPriceSpan(products: Product[]): string {
  if (products.length === 0) {
    return "";
  }

  const { min, max } = getCatalogPriceBounds(products);

  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/** Catalog-wide price span, e.g. "¥6,500 – ¥9,800（全12モデル）". */
export function formatCatalogPriceRange(
  products: Product[],
  modelCount?: number,
): string {
  if (products.length === 0) {
    return "";
  }

  const span = formatCatalogPriceSpan(products);
  const count = modelCount ?? products.length;

  return `${span}（全${count}モデル）`;
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
