import type { ProductFitProfile, SizeReferenceBand } from "@/types/product-fit";
import type { ProductSize } from "@/types";

const DEFAULT_SIZE_REFERENCE: SizeReferenceBand[] = [
  { size: "S", heightMin: 155, heightMax: 168, heightLabel: "155–168cm" },
  { size: "M", heightMin: 165, heightMax: 175, heightLabel: "165–175cm" },
  { size: "L", heightMin: 175, heightMax: 185, heightLabel: "175–185cm" },
  { size: "XL", heightMin: 180, heightMax: 200, heightLabel: "180cm+" },
];

function profile(
  slug: string,
  overrides: Partial<ProductFitProfile> & Pick<ProductFitProfile, "fitType" | "fitLabel" | "models">,
): ProductFitProfile {
  return {
    sizeReference: DEFAULT_SIZE_REFERENCE,
    preferenceAdjustments: { justFit: 0, relaxed: 1, oversized: 2 },
    fitTypeSizeOffset: 0,
    ...overrides,
  };
}

export const FIT_PROFILE_BY_SLUG: Record<string, ProductFitProfile> = {
  "heavyweight-crew-neck": profile("heavyweight-crew-neck", {
    fitType: "regular",
    fitLabel: "Regular fit",
    models: [{ heightCm: 178, weightKg: 68, size: "L" }],
  }),
  "lightweight-pocket-tee": profile("lightweight-pocket-tee", {
    fitType: "regular",
    fitLabel: "Regular fit",
    models: [{ heightCm: 175, weightKg: 62, size: "M" }],
  }),
  "relaxed-fit-tee": profile("relaxed-fit-tee", {
    fitType: "relaxed",
    fitLabel: "Relaxed silhouette",
    models: [{ heightCm: 175, weightKg: 65, size: "L" }],
    fitTypeSizeOffset: 1,
    sizeReference: [
      { size: "S", heightMin: 155, heightMax: 170, heightLabel: "155–170cm" },
      { size: "M", heightMin: 165, heightMax: 178, heightLabel: "165–178cm" },
      { size: "L", heightMin: 172, heightMax: 188, heightLabel: "172–188cm" },
      { size: "XL", heightMin: 180, heightMax: 200, heightLabel: "180cm+" },
    ],
  }),
  "compact-cotton-tee": profile("compact-cotton-tee", {
    fitType: "slim",
    fitLabel: "Slim fit",
    models: [{ heightCm: 170, weightKg: 58, size: "M" }],
    fitTypeSizeOffset: -1,
    sizeReference: [
      { size: "S", heightMin: 150, heightMax: 165, heightLabel: "150–165cm" },
      { size: "M", heightMin: 160, heightMax: 172, heightLabel: "160–172cm" },
      { size: "L", heightMin: 168, heightMax: 180, heightLabel: "168–180cm" },
      { size: "XL", heightMin: 175, heightMax: 195, heightLabel: "175cm+" },
    ],
  }),
  "long-sleeve-essential": profile("long-sleeve-essential", {
    fitType: "regular",
    fitLabel: "Regular fit",
    models: [{ heightCm: 178, weightKg: 66, size: "L" }],
  }),
  "box-fit-tee": profile("box-fit-tee", {
    fitType: "boxy",
    fitLabel: "Boxy shape",
    models: [{ heightCm: 180, weightKg: 72, size: "L" }],
    fitTypeSizeOffset: 1,
    sizeReference: [
      { size: "S", heightMin: 160, heightMax: 172, heightLabel: "160–172cm" },
      { size: "M", heightMin: 168, heightMax: 180, heightLabel: "168–180cm" },
      { size: "L", heightMin: 175, heightMax: 188, heightLabel: "175–188cm" },
      { size: "XL", heightMin: 182, heightMax: 200, heightLabel: "182cm+" },
    ],
  }),
  "short-sleeve-essential": profile("short-sleeve-essential", {
    fitType: "regular",
    fitLabel: "Regular fit",
    models: [{ heightCm: 178, weightKg: 66, size: "L" }],
  }),
  "heavyweight-crew-neck-long-sleeve": profile(
    "heavyweight-crew-neck-long-sleeve",
    {
      fitType: "regular",
      fitLabel: "Regular fit",
      models: [{ heightCm: 178, weightKg: 68, size: "L" }],
    },
  ),
  "lightweight-pocket-tee-long-sleeve": profile(
    "lightweight-pocket-tee-long-sleeve",
    {
      fitType: "regular",
      fitLabel: "Regular fit",
      models: [{ heightCm: 175, weightKg: 62, size: "M" }],
    },
  ),
  "relaxed-fit-tee-long-sleeve": profile("relaxed-fit-tee-long-sleeve", {
    fitType: "relaxed",
    fitLabel: "Relaxed silhouette",
    models: [{ heightCm: 175, weightKg: 65, size: "L" }],
    fitTypeSizeOffset: 1,
    sizeReference: [
      { size: "S", heightMin: 155, heightMax: 170, heightLabel: "155–170cm" },
      { size: "M", heightMin: 165, heightMax: 178, heightLabel: "165–178cm" },
      { size: "L", heightMin: 172, heightMax: 188, heightLabel: "172–188cm" },
      { size: "XL", heightMin: 180, heightMax: 200, heightLabel: "180cm+" },
    ],
  }),
  "compact-cotton-tee-long-sleeve": profile("compact-cotton-tee-long-sleeve", {
    fitType: "slim",
    fitLabel: "Slim fit",
    models: [{ heightCm: 170, weightKg: 58, size: "M" }],
    fitTypeSizeOffset: -1,
    sizeReference: [
      { size: "S", heightMin: 150, heightMax: 165, heightLabel: "150–165cm" },
      { size: "M", heightMin: 160, heightMax: 172, heightLabel: "160–172cm" },
      { size: "L", heightMin: 168, heightMax: 180, heightLabel: "168–180cm" },
      { size: "XL", heightMin: 175, heightMax: 195, heightLabel: "175cm+" },
    ],
  }),
  "box-fit-tee-long-sleeve": profile("box-fit-tee-long-sleeve", {
    fitType: "boxy",
    fitLabel: "Boxy shape",
    models: [{ heightCm: 180, weightKg: 72, size: "L" }],
    fitTypeSizeOffset: 1,
    sizeReference: [
      { size: "S", heightMin: 160, heightMax: 172, heightLabel: "160–172cm" },
      { size: "M", heightMin: 168, heightMax: 180, heightLabel: "168–180cm" },
      { size: "L", heightMin: 175, heightMax: 188, heightLabel: "175–188cm" },
      { size: "XL", heightMin: 182, heightMax: 200, heightLabel: "182cm+" },
    ],
  }),
};

export function getDefaultFitProfile(slug: string): ProductFitProfile {
  return (
    FIT_PROFILE_BY_SLUG[slug] ?? {
      fitType: "regular",
      fitLabel: "Regular fit",
      models: [{ heightCm: 178, weightKg: 68, size: "L" }],
      sizeReference: DEFAULT_SIZE_REFERENCE,
      preferenceAdjustments: { justFit: 0, relaxed: 1, oversized: 2 },
      fitTypeSizeOffset: 0,
    }
  );
}

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
