export const CREDIBILITY_IMAGES = {
  factory: "/store/credibility-factory.png",
  wear: "/store/credibility-wear.png",
  packaging: "/store/credibility-packaging.png",
  craft: "/store/price-craft.png",
} as const;

export type EditorialVoice = {
  source: string;
  line: string;
  detail?: string;
};

export type WearingNote = {
  fabric: string;
  months: number;
  lines: readonly string[];
};

export const EDITORIAL_VOICES: EditorialVoice[] = [
  {
    source: "作り手のメモ",
    line: "白Tは、着た瞬間より洗った後に差が出ます。首元、裾、肩線。その残り方を見てください。",
    detail: "カネマサ莫大小・和歌山",
  },
  {
    source: "選び方",
    line: "1枚で着るなら 28G、毎日の基準は 36G、ジャケットの下には 46G が選びやすいです。",
    detail: "サイズは普段のTシャツから",
  },
  {
    source: "ゲージについて",
    line: "ゲージは、1インチあたりの針の本数です。数字が大きいほど編み目は細かく、生地は薄く密になります。",
    detail: "28G / 36G / 46G",
  },
];

/** One note per gauge. `fabric` must start with the gauge label (see getWearingNoteForFabric). */
export const WEARING_NOTES: WearingNote[] = [
  {
    fabric: "28G Jersey",
    months: 8,
    lines: [
      "双糸の度詰。洗濯を重ねても、首元と肩線が崩れにくい。",
      "表面は少しやわらかくなるが、厚みとハリは残る。",
    ],
  },
  {
    fabric: "36G Jersey",
    months: 6,
    lines: [
      "コンパクト糸は毛羽が少ない。洗っても表面が荒れにくい。",
      "厚みは変わらず、手触りだけが少しなじむ。",
    ],
  },
  {
    fabric: "46G Jersey",
    months: 6,
    lines: [
      "薄手でも目が詰まっているため、裾と袖口が伸びにくい。",
      "落ち感と控えめな光沢は、洗った後も残る。",
    ],
  },
];

export const FACTS = [
  { label: "工場", value: "和歌山・カネマサ莫大小（1964年創業）" },
  { label: "生地", value: "3つのゲージ — 28G / 36G / 46G" },
  { label: "形", value: "2つのシルエット — Regular / Box" },
  { label: "サイズ", value: "S / M / L" },
] as const;

export const PRICE_POSITIONING = {
  headline: "価格に含まれるもの",
  intro:
    "WHITE TEE の価格は、ブランクへのラベル貼りではなく、和歌山での編み立て、ゲージごとの糸選び、仕上げ工程に向けられています。",
  lines: [
    "ゲージごとに選ぶ糸。40/2コーマ糸、60/1コンパクト糸、80/1コーマコンパクト糸。",
    "和歌山での丸編み。28G・36G・46G、それぞれ度目を詰めた度詰天竺。",
    "フラットロック縫製、型付けした襟、出荷前の検品。",
    "同じ機械でも、同じ生地は生まれない。3つのゲージ × 2つのシルエット。",
  ],
  care: "1シーズンで形を失うのではなく、着るほどにやわらかくなることを目指しています。",
} as const;

export const HOME_CREDIBILITY = {
  title: "ブランドについて",
  voicesTitle: "メモと着用",
  wearingTitle: "洗濯を重ねて",
  factsTitle: "概要",
  stockistLink: "和歌山の工場について",
  journalLink: "読みものを見る",
} as const;

export const PDP_CREDIBILITY = {
  voicesTitle: "メモ",
  wearingTitle: "着用後の変化",
  priceTitle: PRICE_POSITIONING.headline,
} as const;

export function getWearingNoteForFabric(
  fabricName: string | null | undefined,
): WearingNote | null {
  if (!fabricName) return WEARING_NOTES[0] ?? null;

  return (
    WEARING_NOTES.find(
      (note) => note.fabric.toLowerCase() === fabricName.toLowerCase(),
    ) ??
    WEARING_NOTES.find((note) =>
      fabricName.toLowerCase().includes(note.fabric.split(" ")[0]!.toLowerCase()),
    ) ??
    WEARING_NOTES[0] ??
    null
  );
}
