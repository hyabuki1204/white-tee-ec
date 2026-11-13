import { createDefaultSizeGuide } from "@/lib/products/defaults";
import type { Product, SizeGuideMeasurement } from "@/types";

/** Regular: standard chest and length. Flat measurements in cm. */
export const REGULAR_SIZE_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 68, shoulder: 44, chest: 52, sleeve: 20 },
  { size: "M", length: 70, shoulder: 46, chest: 54, sleeve: 21 },
  { size: "L", length: 72, shoulder: 48, chest: 56, sleeve: 22 },
];

/** Box: wider chest and shoulder, shorter length. Same grading per size. */
export const BOX_SIZE_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 65, shoulder: 52, chest: 58, sleeve: 23 },
  { size: "M", length: 67, shoulder: 54, chest: 60, sleeve: 24 },
  { size: "L", length: 69, shoulder: 56, chest: 62, sleeve: 25 },
];

export type ProductDetailSeed = {
  detailDescription: string;
  fitNote: string | null;
  sizeGuide: SizeGuideMeasurement[];
};

const REGULAR_LINE = "身幅54cm・着丈70cm（Mサイズ）の標準的なシルエットです。";
const BOX_LINE =
  "身幅60cm・着丈67cm（Mサイズ）。Regularより身幅が6cm広く、着丈が3cm短い箱形です。";

/** Keep in sync with supabase/migrations/gauge-lineup.sql and supabase/seed.sql. */
export const PRODUCT_DETAIL_BY_SLUG: Record<string, ProductDetailSeed> = {
  "28g-regular-tee": {
    detailDescription: `40/2コーマ糸を28ゲージで詰めて編んだ度詰天竺。目付240g/m²。厚みとハリがあり、透けにくい生地です。${REGULAR_LINE}`,
    fitNote: "Regular fit",
    sizeGuide: REGULAR_SIZE_GUIDE,
  },
  "28g-box-tee": {
    detailDescription: `40/2コーマ糸を28ゲージで詰めて編んだ度詰天竺。目付240g/m²。生地のハリで、形が立ちます。${BOX_LINE}`,
    fitNote: "Box fit",
    sizeGuide: BOX_SIZE_GUIDE,
  },
  "36g-regular-tee": {
    detailDescription: `60/1コンパクト糸を36ゲージで編んだ度詰天竺。目付160g/m²。毛羽が少なく、表面は滑らかで均一です。${REGULAR_LINE}`,
    fitNote: "Regular fit",
    sizeGuide: REGULAR_SIZE_GUIDE,
  },
  "36g-box-tee": {
    detailDescription: `60/1コンパクト糸を36ゲージで編んだ度詰天竺。目付160g/m²。落ち着いた表面を、ゆとりのある形で。${BOX_LINE}`,
    fitNote: "Box fit",
    sizeGuide: BOX_SIZE_GUIDE,
  },
  "46g-regular-tee": {
    detailDescription: `80/1コーマコンパクト糸を46ゲージで編んだ度詰天竺。目付130g/m²。1インチに針46本。薄手でも目が詰まり、布帛のような落ち感と控えめな光沢が出ます。${REGULAR_LINE}`,
    fitNote: "Regular fit",
    sizeGuide: REGULAR_SIZE_GUIDE,
  },
  "46g-box-tee": {
    detailDescription: `80/1コーマコンパクト糸を46ゲージで編んだ度詰天竺。目付130g/m²。1インチに針46本。薄く密な生地が、広い身幅からまっすぐ落ちます。${BOX_LINE}`,
    fitNote: "Box fit",
    sizeGuide: BOX_SIZE_GUIDE,
  },
};

export function getProductDetailSeed(slug: string): ProductDetailSeed {
  const seed = PRODUCT_DETAIL_BY_SLUG[slug];
  if (seed) return seed;

  return {
    detailDescription: "",
    fitNote: null,
    sizeGuide: createDefaultSizeGuide(),
  };
}

export function sizeGuideToJson(guide: SizeGuideMeasurement[]): Product["sizeGuide"] {
  return guide.map((row) => ({ ...row }));
}
