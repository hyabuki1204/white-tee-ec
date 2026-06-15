import { shiftSize, SIZE_ORDER } from "@/lib/products/fit-profiles";
import type {
  ProductFitProfile,
  SizeRecommendationInput,
  SizeRecommendationResult,
} from "@/types/product-fit";
import type { ProductSize } from "@/types";

function scoreBand(
  heightCm: number,
  weightKg: number,
  band: ProductFitProfile["sizeReference"][number],
): number {
  let score = 0;

  if (heightCm >= band.heightMin && heightCm <= band.heightMax) {
    score += 10;
  } else {
    const dist =
      heightCm < band.heightMin
        ? band.heightMin - heightCm
        : heightCm - band.heightMax;
    score -= dist * 0.5;
  }

  if (band.weightMin != null && band.weightMax != null) {
    if (weightKg >= band.weightMin && weightKg <= band.weightMax) {
      score += 4;
    } else {
      const wDist =
        weightKg < band.weightMin
          ? band.weightMin - weightKg
          : weightKg - band.weightMax;
      score -= wDist * 0.2;
    }
  }

  return score;
}

function baseSizeFromMetrics(
  input: SizeRecommendationInput,
  profile: ProductFitProfile,
  available: ProductSize[],
): ProductSize {
  const scored = profile.sizeReference
    .filter((band) => available.includes(band.size))
    .map((band) => ({
      size: band.size,
      score: scoreBand(input.heightCm, input.weightKg, band),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.size ?? available[Math.floor(available.length / 2)] ?? "M";

  const offset = profile.fitTypeSizeOffset ?? 0;
  return shiftSize(best, offset, available);
}

function preferenceDelta(
  preference: SizeRecommendationInput["preference"],
  profile: ProductFitProfile,
): number {
  const adj = profile.preferenceAdjustments ?? {
    justFit: 0,
    relaxed: 1,
    oversized: 2,
  };

  switch (preference) {
    case "relaxed":
      return adj.relaxed;
    case "oversized":
      return adj.oversized;
    default:
      return adj.justFit;
  }
}

export function recommendSize(
  input: SizeRecommendationInput,
  profile: ProductFitProfile,
  availableSizes: ProductSize[],
): SizeRecommendationResult | null {
  const available = SIZE_ORDER.filter((size) => availableSizes.includes(size));

  if (available.length === 0) {
    return null;
  }

  const base = baseSizeFromMetrics(input, profile, available);
  const recommended = shiftSize(
    base,
    preferenceDelta(input.preference, profile),
    available,
  );

  const smaller = shiftSize(recommended, -1, available);
  const larger = shiftSize(recommended, 1, available);

  const primaryLine = `Recommended size: ${recommended}`;

  const secondaryParts: string[] = [];

  if (larger !== recommended) {
    secondaryParts.push(`For a more relaxed fit, choose ${larger}.`);
  }

  if (smaller !== recommended) {
    secondaryParts.push(`For a closer fit, choose ${smaller}.`);
  }

  const helperJa = buildHelperJa(recommended, smaller, larger);

  return {
    recommended,
    primaryLine,
    secondaryLine: secondaryParts.length > 0 ? secondaryParts.join(" ") : undefined,
    helperJa,
  };
}

function buildHelperJa(
  recommended: ProductSize,
  smaller: ProductSize,
  larger: ProductSize,
): string {
  const parts = [`ジャストに着るなら ${recommended}`];

  if (larger !== recommended) {
    parts.push(`少しゆったりなら ${larger}`);
  }

  if (smaller !== recommended) {
    parts.push(`よりフィットさせるなら ${smaller}`);
  }

  return `${parts.join("、")} がおすすめです。`;
}
