import type { FabricCharacter, FabricCharacterLevel } from "@/lib/fabric/character";
import type { Fabric } from "@/lib/fabric/content";
import { PRICE_POSITIONING } from "@/lib/store-ui/credibility";
import type { Product } from "@/types";

export const PDP_VALUE_IMAGES = {
  fabric: "/store/pdp-fabric-macro.png",
  finish: "/store/pdp-collar-finish.png",
} as const;

const THICKNESS_COPY: Record<FabricCharacterLevel, string> = {
  1: "ごく薄手",
  2: "薄手で、目が詰まっている",
  3: "厚すぎず、薄すぎない",
  4: "形を保つ、やや肉厚の生地",
  5: "双糸で編んだ、肉厚でハリのある生地",
};

const SHEERNESS_COPY: Record<FabricCharacterLevel, string> = {
  1: "日中も透けにくい",
  2: "透け感は少ない",
  3: "強い光下でやや見える",
  4: "直射日光で透けやすい",
  5: "日中でも透け感あり",
};

const DEFAULT_FABRIC_SLUG = "36g-jersey";

const FABRIC_VALUE_LINES: Record<string, readonly string[]> = {
  "28g-jersey": [
    "40/2コーマ糸の双糸を、28ゲージで詰めて編んだ度詰天竺。",
    "目付240g/m²。厚みとハリがあり、1枚で着ても透けにくい。",
    "洗っても、首元と肩線が崩れにくい生地です。",
  ],
  "36g-jersey": [
    "毛羽の少ない60/1コンパクト糸を、36ゲージで編んだ度詰天竺。",
    "目付160g/m²。表面は滑らかで均一。",
    "厚すぎず薄すぎず、一年を通して着られます。",
  ],
  "46g-jersey": [
    "80/1コーマコンパクト糸を、46ゲージで編んだ度詰天竺。",
    "目付130g/m²。1インチに針46本、薄手でも目が詰まっています。",
    "布帛のような落ち感と、控えめな光沢。ジャケットの下に収まります。",
  ],
};

const CONSTRUCTION_LINES = [
  "肩と脇にフラットロック縫製。",
  "襟は手で型付け・プレス。",
  "和歌山を出る前に検品。",
] as const;

export type PdpValueContent = {
  headline: string;
  lines: readonly string[];
  construction: readonly string[];
  priceNote?: string;
  specs: { label: string; value: string }[];
  images: { src: string; alt: string }[];
};

function characterSpec(
  character: FabricCharacter,
): { label: string; value: string }[] {
  return [
    { label: "厚み", value: THICKNESS_COPY[character.thickness] },
    { label: "透け感", value: SHEERNESS_COPY[character.sheerness] },
  ];
}

export function buildPdpValueContent(
  product: Product,
  fabric: Fabric | null | undefined,
): PdpValueContent {
  const fabricSlug = fabric?.slug ?? product.fabricSlug ?? DEFAULT_FABRIC_SLUG;
  const character = fabric?.character ?? {
    thickness: 3,
    softness: 3,
    structure: 3,
    sheerness: 2,
    surface: 3,
  };

  return {
    headline: "この一枚について",
    lines:
      FABRIC_VALUE_LINES[fabricSlug] ??
      FABRIC_VALUE_LINES[DEFAULT_FABRIC_SLUG]!,
    construction: CONSTRUCTION_LINES,
    priceNote: PRICE_POSITIONING.care,
    specs: [
      ...characterSpec(character),
      { label: "フィット", value: product.fitProfile.fitLabel },
      { label: "製造", value: "和歌山で編立て" },
    ],
    images: [
      {
        src: PDP_VALUE_IMAGES.fabric,
        alt: `${fabric?.name ?? "天竺"}の生地感`,
      },
      {
        src: PDP_VALUE_IMAGES.finish,
        alt: "襟と縫製のディテール",
      },
    ],
  };
}
