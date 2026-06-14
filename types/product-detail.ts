import type { SizeGuideMeasurement } from "@/types";

/** PDP tab content derived from a Product. */
export type ProductDetailContent = {
  description: string;
  fitNote?: string;
  material: string;
  care: string;
  sizeGuide: SizeGuideMeasurement[];
};
