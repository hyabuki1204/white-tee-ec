import { getGaugeNumber } from "@/lib/fabric/gauge";
import type { Product } from "@/types";

/** Catalog title: gauge first, then silhouette — "46G Regular Tee". */
export function getGraphpaperDisplayName(
  product: Pick<Product, "name" | "fabricSlug" | "fitType" | "sleeveType">,
  fabricName?: string | null,
): string {
  const gauge = getGaugeNumber(product.fabricSlug);
  const silhouette = product.fitType === "boxy" ? "Box" : "Regular";
  const sleeve = product.sleeveType === "long" ? " L/S" : "";

  if (gauge) {
    return `${gauge}G ${silhouette}${sleeve} Tee`;
  }

  return fabricName ? `${fabricName} ${silhouette}${sleeve} Tee` : product.name;
}

export const STORE_BRAND_LINE = "WHITE TEE";
