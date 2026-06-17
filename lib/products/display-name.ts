import type { Product } from "@/types";
import type { FitType, SleeveType } from "@/types/product-fit";

const FIT_LABEL: Record<FitType, string> = {
  slim: "Slim",
  regular: "Regular",
  relaxed: "Relaxed",
  boxy: "Boxy",
};

function sleeveLabel(sleeve: SleeveType): string {
  return sleeve === "long" ? "L/S" : "S/S";
}

function isPocketTee(slug: string): boolean {
  return (
    slug === "lightweight-pocket-tee" ||
    slug === "lightweight-pocket-tee-long-sleeve"
  );
}

/** Graphpaper-style catalog title derived from fabric + silhouette. */
export function getGraphpaperDisplayName(
  product: Product,
  fabricName?: string | null,
): string {
  const fabric = fabricName ?? "Jersey";
  const sleeve = sleeveLabel(product.sleeveType);
  const fit = FIT_LABEL[product.fitType];

  if (isPocketTee(product.slug)) {
    return `${fabric} ${sleeve} Pocket Crew Neck Tee`;
  }

  if (product.fitType === "boxy") {
    return `${fabric} ${sleeve} Boxy Crew Neck Tee`;
  }

  return `${fabric} ${sleeve} ${fit} Crew Neck Tee`;
}

export const STORE_BRAND_LINE = "WHITE TEE";
