import type { FitType, SleeveType } from "@/types/product-fit";
import {
  PRODUCT_CATALOG,
  PRODUCT_CATALOG_BY_SLUG,
} from "@/lib/products/product-catalog";

/** Admin / database only — the storefront lineup is short sleeve throughout. */
export const SLEEVE_TYPES: SleeveType[] = ["short", "long"];

export const FIT_TYPES: FitType[] = ["slim", "regular", "relaxed", "boxy"];

export const SLEEVE_TYPE_LABELS: Record<SleeveType, string> = {
  short: "Short sleeve",
  long: "Long sleeve",
};

export const FIT_TYPE_LABELS: Record<FitType, string> = {
  slim: "Slim",
  regular: "Regular",
  relaxed: "Relaxed",
  boxy: "Box",
};

/** Silhouettes offered on the storefront, in display order. */
export const STOREFRONT_FIT_TYPES: FitType[] = ["regular", "boxy"];

/**
 * Parse the `fit` query param. Only the two current silhouettes are accepted;
 * anything else (including retired fits such as slim / relaxed) is ignored.
 */
export function parseStorefrontFit(value: unknown): FitType | null {
  if (value === "box") {
    return "boxy";
  }

  return STOREFRONT_FIT_TYPES.includes(value as FitType)
    ? (value as FitType)
    : null;
}

/** @deprecated Prefer PRODUCT_CATALOG sleeveType. */
export const SLEEVE_TYPE_BY_SLUG: Record<string, SleeveType> =
  Object.fromEntries(
    PRODUCT_CATALOG.map((entry) => [entry.slug, entry.sleeveType]),
  );

export function getDefaultSleeveType(slug: string): SleeveType {
  return PRODUCT_CATALOG_BY_SLUG[slug]?.sleeveType ?? "short";
}

export function getDefaultFitType(slug: string): FitType {
  return PRODUCT_CATALOG_BY_SLUG[slug]?.fitType ?? "regular";
}

export function isSleeveType(value: unknown): value is SleeveType {
  return value === "short" || value === "long";
}

export function isFitType(value: unknown): value is FitType {
  return (
    value === "slim" ||
    value === "regular" ||
    value === "relaxed" ||
    value === "boxy"
  );
}

/** PLP filter URL: `fabric` (gauge), `fit` (silhouette), `stock`. */
export function buildProductsFilterHref(options: {
  fit?: FitType | null;
  fabric?: string | null;
  stock?: "in" | null;
}): string {
  const params = new URLSearchParams();

  if (options.fabric) {
    params.set("fabric", options.fabric);
  }

  if (options.fit) {
    params.set("fit", options.fit);
  }

  if (options.stock === "in") {
    params.set("stock", "in");
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function isInStockProduct(product: {
  variants: { stockQuantity: number }[];
}): boolean {
  return product.variants.some((variant) => variant.stockQuantity > 0);
}
