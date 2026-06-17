import { createDefaultSizeGuide } from "@/lib/products/defaults";
import type { Product, SizeGuideMeasurement } from "@/types";

const SHORT_SLEEVE_GUIDE = createDefaultSizeGuide();

const RELAXED_SHORT_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 70, shoulder: 48, chest: 56, sleeve: 22 },
  { size: "M", length: 72, shoulder: 50, chest: 58, sleeve: 23 },
  { size: "L", length: 74, shoulder: 52, chest: 60, sleeve: 24 },
  { size: "XL", length: 76, shoulder: 54, chest: 62, sleeve: 25 },
];

const COMPACT_SHORT_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 66, shoulder: 42, chest: 48, sleeve: 19 },
  { size: "M", length: 68, shoulder: 44, chest: 50, sleeve: 20 },
  { size: "L", length: 70, shoulder: 46, chest: 52, sleeve: 21 },
  { size: "XL", length: 72, shoulder: 48, chest: 54, sleeve: 22 },
];

const BOX_SHORT_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 70, shoulder: 48, chest: 56, sleeve: 22 },
  { size: "M", length: 72, shoulder: 50, chest: 58, sleeve: 23 },
  { size: "L", length: 74, shoulder: 52, chest: 60, sleeve: 24 },
  { size: "XL", length: 76, shoulder: 54, chest: 62, sleeve: 25 },
];

const LONG_SLEEVE_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 70, shoulder: 44, chest: 52, sleeve: 58 },
  { size: "M", length: 72, shoulder: 46, chest: 54, sleeve: 59 },
  { size: "L", length: 74, shoulder: 48, chest: 56, sleeve: 60 },
  { size: "XL", length: 76, shoulder: 50, chest: 58, sleeve: 61 },
];

const HEAVYWEIGHT_LONG_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 68, shoulder: 44, chest: 52, sleeve: 58 },
  { size: "M", length: 70, shoulder: 46, chest: 54, sleeve: 59 },
  { size: "L", length: 72, shoulder: 48, chest: 56, sleeve: 60 },
  { size: "XL", length: 74, shoulder: 50, chest: 58, sleeve: 61 },
];

const RELAXED_LONG_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 70, shoulder: 48, chest: 56, sleeve: 58 },
  { size: "M", length: 72, shoulder: 50, chest: 58, sleeve: 59 },
  { size: "L", length: 74, shoulder: 52, chest: 60, sleeve: 60 },
  { size: "XL", length: 76, shoulder: 54, chest: 62, sleeve: 61 },
];

const COMPACT_LONG_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 66, shoulder: 42, chest: 48, sleeve: 58 },
  { size: "M", length: 68, shoulder: 44, chest: 50, sleeve: 59 },
  { size: "L", length: 70, shoulder: 46, chest: 52, sleeve: 60 },
  { size: "XL", length: 72, shoulder: 48, chest: 54, sleeve: 61 },
];

const BOX_LONG_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 70, shoulder: 48, chest: 56, sleeve: 58 },
  { size: "M", length: 72, shoulder: 50, chest: 58, sleeve: 59 },
  { size: "L", length: 74, shoulder: 52, chest: 60, sleeve: 60 },
  { size: "XL", length: 76, shoulder: 54, chest: 62, sleeve: 61 },
];

export type ProductDetailSeed = {
  detailDescription: string;
  fitNote: string | null;
  sizeGuide: SizeGuideMeasurement[];
};

export const PRODUCT_DETAIL_BY_SLUG: Record<string, ProductDetailSeed> = {
  "heavyweight-crew-neck": {
    detailDescription:
      "厚手のコットン100%ジャージー。しっかりとした密度で、白の輪郭がはっきりと立つ一枚です。",
    fitNote: "Regular fit",
    sizeGuide: SHORT_SLEEVE_GUIDE,
  },
  "lightweight-pocket-tee": {
    detailDescription:
      "軽量なコットン100%。肌に沿うような柔らかさと、通気性のよい風合い。左胸のポケット付き。",
    fitNote: "Regular fit",
    sizeGuide: SHORT_SLEEVE_GUIDE,
  },
  "relaxed-fit-tee": {
    detailDescription:
      "ゆとりのあるシルエットとドロップショルダー。肩のラインを落とし、体のラインを強調しない着心地。",
    fitNote: "Relaxed fit",
    sizeGuide: RELAXED_SHORT_GUIDE,
  },
  "compact-cotton-tee": {
    detailDescription:
      "コンパクトな身幅と短めの着丈。インナーとして重ねやすく、ジャケットの下にも余計なボリュームを出しません。",
    fitNote: "Slim fit",
    sizeGuide: COMPACT_SHORT_GUIDE,
  },
  "long-sleeve-essential": {
    detailDescription:
      "長袖の定番Tシャツ。袖口はシンプルな仕上げで、季節を問わず白の質感を楽しめる一着です。",
    fitNote: "Regular fit",
    sizeGuide: LONG_SLEEVE_GUIDE,
  },
  "box-fit-tee": {
    detailDescription:
      "ボックスシルエット。直線的なラインが、白の存在感を静かに引き立てます。",
    fitNote: "Box fit",
    sizeGuide: BOX_SHORT_GUIDE,
  },
  "short-sleeve-essential": {
    detailDescription:
      "Essential Jerseyの半袖定番。バランスの取れた身幅と、一年中着られる標準的な着丈です。",
    fitNote: "Regular fit",
    sizeGuide: SHORT_SLEEVE_GUIDE,
  },
  "heavyweight-crew-neck-long-sleeve": {
    detailDescription:
      "Heavyweight Jerseyの長袖版。厚手の密度を保ちながら、袖丈を延ばした冬向けの一枚です。",
    fitNote: "Regular fit",
    sizeGuide: HEAVYWEIGHT_LONG_GUIDE,
  },
  "lightweight-pocket-tee-long-sleeve": {
    detailDescription:
      "Lightweight Jerseyの長袖ポケットT。軽やかな風合いと左胸ポケットを、長袖シルエットで。",
    fitNote: "Regular fit",
    sizeGuide: LONG_SLEEVE_GUIDE,
  },
  "relaxed-fit-tee-long-sleeve": {
    detailDescription:
      "Relaxed Jerseyの長袖版。ドロップショルダーとゆとりのあるラインを、長袖で楽しめる一着。",
    fitNote: "Relaxed fit",
    sizeGuide: RELAXED_LONG_GUIDE,
  },
  "compact-cotton-tee-long-sleeve": {
    detailDescription:
      "Compact Jerseyの長袖版。コンパクトな身幅のまま、レイヤード向きの長袖シルエット。",
    fitNote: "Slim fit",
    sizeGuide: COMPACT_LONG_GUIDE,
  },
  "box-fit-tee-long-sleeve": {
    detailDescription:
      "Box Jerseyの長袖版。ボックスシルエットの直線を、長袖でより静かに際立たせます。",
    fitNote: "Box fit",
    sizeGuide: BOX_LONG_GUIDE,
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
