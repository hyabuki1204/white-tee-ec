import type { FitType, SleeveType } from "@/types/product-fit";
import {
  PRODUCT_CATALOG,
  PRODUCT_CATALOG_BY_SLUG,
} from "@/lib/products/product-catalog";

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
  boxy: "Boxy",
};

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

export function getProductsByFabricAndSleeve(
  products: { fabricSlug: string | null; sleeveType: SleeveType; slug: string }[],
  fabricSlug: string,
  sleeve: SleeveType,
): typeof products {
  return products.filter(
    (product) =>
      product.fabricSlug === fabricSlug && product.sleeveType === sleeve,
  );
}

export function buildProductsFilterHref(options: {
  sleeve?: SleeveType | null;
  fit?: FitType | null;
  fabric?: string | null;
}): string {
  const params = new URLSearchParams();

  if (options.fabric) {
    params.set("fabric", options.fabric);
  }

  if (options.sleeve) {
    params.set("sleeve", options.sleeve);
  }

  if (options.fit) {
    params.set("fit", options.fit);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}
