import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import type { ProductFitProfile, SizeReferenceBand } from "@/types/product-fit";
import type { ProductSize } from "@/types";

/** Height bands for S / M / L. L is the largest size, so its band is open-ended. */
const DEFAULT_SIZE_REFERENCE: SizeReferenceBand[] = [
  { size: "S", heightMin: 155, heightMax: 168, heightLabel: "155–168cm" },
  { size: "M", heightMin: 165, heightMax: 175, heightLabel: "165–175cm" },
  { size: "L", heightMin: 175, heightMax: 200, heightLabel: "175cm+" },
];

const DEFAULT_PREFERENCE_ADJUSTMENTS = { justFit: 0, relaxed: 1, oversized: 2 };

/** Standard chest and length. */
export const REGULAR_FIT_PROFILE: ProductFitProfile = {
  fitType: "regular",
  fitLabel: "Regular fit",
  models: [{ heightCm: 178, weightKg: 68, size: "L" }],
  sizeReference: DEFAULT_SIZE_REFERENCE,
  fitTypeSizeOffset: 0,
  preferenceAdjustments: DEFAULT_PREFERENCE_ADJUSTMENTS,
};

/**
 * Wider chest and shoulder, shorter length. The width is in the pattern,
 * so the recommended size is not shifted up.
 */
export const BOX_FIT_PROFILE: ProductFitProfile = {
  fitType: "boxy",
  fitLabel: "Box fit",
  models: [{ heightCm: 178, weightKg: 68, size: "L" }],
  sizeReference: DEFAULT_SIZE_REFERENCE,
  fitTypeSizeOffset: 0,
  preferenceAdjustments: DEFAULT_PREFERENCE_ADJUSTMENTS,
};

/** Keep in sync with supabase/migrations/gauge-lineup.sql. */
export const FIT_PROFILE_BY_SLUG: Record<string, ProductFitProfile> =
  Object.fromEntries(
    PRODUCT_CATALOG.map((entry) => [
      entry.slug,
      entry.fitType === "boxy" ? BOX_FIT_PROFILE : REGULAR_FIT_PROFILE,
    ]),
  );

export function getDefaultFitProfile(slug: string): ProductFitProfile {
  return FIT_PROFILE_BY_SLUG[slug] ?? REGULAR_FIT_PROFILE;
}

/** XL stays in the order so legacy rows still sort; current lineup is S / M / L. */
export const SIZE_ORDER: ProductSize[] = ["S", "M", "L", "XL"];

export function shiftSize(
  size: ProductSize,
  delta: number,
  available: ProductSize[],
): ProductSize {
  const order = SIZE_ORDER.filter((s) => available.includes(s));
  const index = order.indexOf(size);

  if (index === -1) {
    return available[0] ?? size;
  }

  const next = order[Math.min(order.length - 1, Math.max(0, index + delta))];
  return next ?? size;
}
