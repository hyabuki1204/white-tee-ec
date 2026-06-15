import type { ProductSize } from "@/types";

export type FitType = "slim" | "regular" | "relaxed" | "boxy";

export type SleeveType = "short" | "long";

export type FitPreference = "just-fit" | "relaxed" | "oversized";

export type ProductModelProfile = {
  heightCm: number;
  weightKg: number;
  size: ProductSize;
  /** Optional label for future multi-model display. */
  label?: string;
};

export type SizeReferenceBand = {
  size: ProductSize;
  heightMin: number;
  heightMax: number;
  weightMin?: number;
  weightMax?: number;
  /** Display hint e.g. "165–175cm" */
  heightLabel?: string;
};

export type ProductFitProfile = {
  fitType: FitType;
  fitLabel: string;
  models: ProductModelProfile[];
  sizeReference: SizeReferenceBand[];
  /** Shifts base size before preference adjustment (boxy +1, slim -1). */
  fitTypeSizeOffset?: number;
  preferenceAdjustments?: {
    justFit: number;
    relaxed: number;
    oversized: number;
  };
};

export type SizeRecommendationInput = {
  heightCm: number;
  weightKg: number;
  preference: FitPreference;
};

export type SizeRecommendationResult = {
  recommended: ProductSize;
  primaryLine: string;
  secondaryLine?: string;
  helperJa?: string;
};
