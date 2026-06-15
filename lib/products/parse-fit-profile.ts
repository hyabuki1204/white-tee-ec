import { getDefaultFitProfile } from "@/lib/products/fit-profiles";
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

  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
    return null;
  }

  return {
    heightCm,
    weightKg,
    size: size as ProductSize,
    label: typeof row.label === "string" ? row.label : undefined,
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

    bands.push({
      size: size as ProductSize,
      heightMin: Number(row.heightMin) || 0,
      heightMax: Number(row.heightMax) || 0,
      weightMin: row.weightMin != null ? Number(row.weightMin) : undefined,
      weightMax: row.weightMax != null ? Number(row.weightMax) : undefined,
      heightLabel:
        typeof row.heightLabel === "string" ? row.heightLabel : undefined,
    });
  }

  return bands.length > 0 ? bands : null;
}

export function parseFitProfileFromRow(
  slug: string,
  raw: unknown,
): ProductFitProfile {
  const defaults = getDefaultFitProfile(slug);

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const input = raw as Record<string, unknown>;
  const fitType = FIT_TYPES.includes(input.fitType as FitType)
    ? (input.fitType as FitType)
    : defaults.fitType;

  const models = Array.isArray(input.models)
    ? input.models
        .map(parseModel)
        .filter((model): model is ProductModelProfile => model !== null)
    : defaults.models;

  const sizeReference =
    parseSizeReference(input.sizeReference) ?? defaults.sizeReference;

  const adjustments = input.preferenceAdjustments;

  return {
    fitType,
    fitLabel:
      typeof input.fitLabel === "string" && input.fitLabel.trim()
        ? input.fitLabel.trim()
        : defaults.fitLabel,
    models: models.length > 0 ? models : defaults.models,
    sizeReference,
    fitTypeSizeOffset:
      typeof input.fitTypeSizeOffset === "number"
        ? input.fitTypeSizeOffset
        : defaults.fitTypeSizeOffset,
    preferenceAdjustments:
      adjustments &&
      typeof adjustments === "object" &&
      "justFit" in adjustments
        ? {
            justFit: Number(
              (adjustments as Record<string, unknown>).justFit ?? 0,
            ),
            relaxed: Number(
              (adjustments as Record<string, unknown>).relaxed ?? 1,
            ),
            oversized: Number(
              (adjustments as Record<string, unknown>).oversized ?? 2,
            ),
          }
        : defaults.preferenceAdjustments,
  };
}
