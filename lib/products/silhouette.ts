import type { FitType, SleeveType } from "@/types/product-fit";

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

export const SLEEVE_TYPE_BY_SLUG: Record<string, SleeveType> = {
  "long-sleeve-essential": "long",
};

export function getDefaultSleeveType(slug: string): SleeveType {
  return SLEEVE_TYPE_BY_SLUG[slug] ?? "short";
}

export function isSleeveType(value: unknown): value is SleeveType {
  return value === "short" || value === "long";
}

export function isFitType(value: unknown): value is FitType {
  return FIT_TYPES.includes(value as FitType);
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
