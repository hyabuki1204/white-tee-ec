import type { FabricCharacter, FabricCharacterLevel } from "@/lib/fabric/character";
import type { Fabric } from "@/lib/fabric/content";
import { PRICE_POSITIONING } from "@/lib/store-ui/credibility";
import type { Product } from "@/types";

export const PDP_VALUE_IMAGES = {
  fabric: "/store/pdp-fabric-macro.png",
  finish: "/store/pdp-collar-finish.png",
} as const;

const THICKNESS_COPY: Record<FabricCharacterLevel, string> = {
  1: "細番手で軽やか",
  2: "ループ間に空気のある薄手",
  3: "厚みと落ち感のバランス",
  4: "形を保つしっかりした生地",
  5: "密度の高いヘビーウェイト",
};

const SHEERNESS_COPY: Record<FabricCharacterLevel, string> = {
  1: "日中も透けにくい",
  2: "透け感は少ない",
  3: "強い光下でやや見える",
  4: "直射日光で透けやすい",
  5: "日中でも透け感あり",
};

const FABRIC_VALUE_LINES: Record<string, readonly string[]> = {
  "heavyweight-jersey": [
    "形を保つコンパクトなコットンジャージー。",
    "和歌山で高密度に編み、ボディ感を出しています。",
    "白の輪郭がはっきり——裾や襟でにじみにくい。",
  ],
  "lightweight-jersey": [
    "細い糸、開いた編みで暑さと動きに対応。",
    "和歌山の円編で表面を均一に。",
    "肌に軽く、一日中形を保ちやすい。",
  ],
  "relaxed-jersey": [
    "ゆとりを編み込んだ中厚手コットン。",
    "和歌山円編、ドレープ向けに調整。",
    "体に余計なボリュームを出さないゆとり。",
  ],
  "compact-jersey": [
    "すっきりしたラインのためのタイトゲージ。",
    "和歌山で編み、襟と裾を保つ。",
    "毛羽立ちの少ない滑らかな手触り。",
  ],
  "essential-jersey": [
    "毎日使える、バランスの取れた定番の厚み。",
    "和歌山編立てでループ張力を均一に。",
    "ラインナップの基準となる白T。",
  ],
  "box-jersey": [
    "肩と裾に構造を持つワイドゲージ。",
    "和歌山の密度ある編みでボックスシルエットを支える。",
    "やわらかさではなく、意図した形を保つ。",
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
  const fabricSlug = fabric?.slug ?? product.fabricSlug ?? "essential-jersey";
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
      FABRIC_VALUE_LINES["essential-jersey"]!,
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
        alt: `${fabric?.name ?? "ジャージー"}の生地感`,
      },
      {
        src: PDP_VALUE_IMAGES.finish,
        alt: "襟と縫製のディテール",
      },
    ],
  };
}
