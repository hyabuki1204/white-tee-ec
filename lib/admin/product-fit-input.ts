import { PRODUCT_SIZES } from "@/lib/products/defaults";
import type {
  FitType,
  ProductFitProfile,
  ProductModelProfile,
  SizeReferenceBand,
} from "@/types/product-fit";
import type { ProductSize } from "@/types";

const FIT_TYPES: FitType[] = ["slim", "regular", "relaxed", "boxy"];

function parseModel(value: unknown): ProductModelProfile | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  const size = row.size;

  if (typeof size !== "string" || !PRODUCT_SIZES.includes(size as ProductSize)) {
    return null;
  }

  const heightCm = Number(row.heightCm);
  const weightKg = Number(row.weightKg);

  if (
    !Number.isFinite(heightCm) ||
    heightCm <= 0 ||
    !Number.isFinite(weightKg) ||
    weightKg <= 0
  ) {
    return null;
  }

  return {
    heightCm: Math.round(heightCm),
    weightKg: Math.round(weightKg),
    size: size as ProductSize,
    label:
      typeof row.label === "string" && row.label.trim()
        ? row.label.trim()
        : undefined,
  };
}

function parseSizeReference(value: unknown): SizeReferenceBand[] | null {
  if (!Array.isArray(value)) return null;

  const bands: SizeReferenceBand[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const row = item as Record<string, unknown>;
    const size = row.size;

    if (typeof size !== "string" || !PRODUCT_SIZES.includes(size as ProductSize)) {
      continue;
    }

    const heightMin = Number(row.heightMin);
    const heightMax = Number(row.heightMax);

    if (!Number.isFinite(heightMin) || !Number.isFinite(heightMax)) {
      continue;
    }

    bands.push({
      size: size as ProductSize,
      heightMin: Math.round(heightMin),
      heightMax: Math.round(heightMax),
      weightMin:
        row.weightMin != null && Number.isFinite(Number(row.weightMin))
          ? Math.round(Number(row.weightMin))
          : undefined,
      weightMax:
        row.weightMax != null && Number.isFinite(Number(row.weightMax))
          ? Math.round(Number(row.weightMax))
          : undefined,
      heightLabel:
        typeof row.heightLabel === "string" && row.heightLabel.trim()
          ? row.heightLabel.trim()
          : undefined,
    });
  }

  return bands.length > 0 ? bands : null;
}

export function parseAdminFitProfile(value: unknown): ProductFitProfile | string {
  if (!value || typeof value !== "object") {
    return "Fit profile is required.";
  }

  const input = value as Record<string, unknown>;

  if (!FIT_TYPES.includes(input.fitType as FitType)) {
    return "Fit type must be slim, regular, relaxed, or boxy.";
  }

  const fitLabel =
    typeof input.fitLabel === "string" ? input.fitLabel.trim() : "";

  if (!fitLabel) {
    return "Fit label is required.";
  }

  if (!Array.isArray(input.models) || input.models.length === 0) {
    return "At least one model profile is required.";
  }

  const models = input.models
    .map(parseModel)
    .filter((model): model is ProductModelProfile => model !== null);

  if (models.length === 0) {
    return "At least one valid model profile is required.";
  }

  const sizeReference = parseSizeReference(input.sizeReference);

  if (!sizeReference) {
    return "Size reference bands are required.";
  }

  const fitTypeSizeOffset = Number(input.fitTypeSizeOffset);

  if (!Number.isInteger(fitTypeSizeOffset)) {
    return "Fit type size offset must be an integer.";
  }

  const adjustments = input.preferenceAdjustments;

  if (!adjustments || typeof adjustments !== "object") {
    return "Preference adjustments are required.";
  }

  const row = adjustments as Record<string, unknown>;
  const justFit = Number(row.justFit);
  const relaxed = Number(row.relaxed);
  const oversized = Number(row.oversized);

  if (
    !Number.isInteger(justFit) ||
    !Number.isInteger(relaxed) ||
    !Number.isInteger(oversized)
  ) {
    return "Preference adjustments must be integers.";
  }

  return {
    fitType: input.fitType as FitType,
    fitLabel,
    models,
    sizeReference,
    fitTypeSizeOffset,
    preferenceAdjustments: { justFit, relaxed, oversized },
  };
}
