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
    detail: "Kanemasa, Wakayama",
  },
  {
    source: "スタイリングノート",
    line: "1枚で着るなら Heavyweight、真夏は Lightweight、重ね着なら Compact が選びやすいです。",
    detail: "サイズは普段のTシャツから",
  },
  {
    source: "着用の声",
    line: "多くの方が、構造用の Heavyweight と、暑い季節用の Lightweight の2枚を持っています。",
    detail: "リピート購入データより",
  },
];

export const WEARING_NOTES: WearingNote[] = [
  {
    fabric: "Heavyweight Jersey",
    months: 8,
    lines: [
      "首元のラインが保たれ、繰り返しの洗濯後もクルミにくい。",
      "表面はやわらかくなるが、形は残る。疲れた印象にはならない。",
    ],
  },
  {
    fabric: "Lightweight Jersey",
    months: 6,
    lines: [
      "最初から軽く、通気性がよい。洗うほどにドレープが開く。",
      "日中の透け感は予測可能。1回洗った後に驚くことはない。",
    ],
  },
  {
    fabric: "Compact Jersey",
    months: 5,
    lines: [
      "裾と袖のラインがすっきり保たれる。袖口の伸びが少ない。",
      "初日から滑らかな手触り。3回洗っても表面の毛羽立ちが出にくい。",
    ],
  },
];

export const FACTS = [
  { label: "工場", value: "和歌山・Kanemasa" },
  { label: "生地", value: "6種類のジャージー" },
  { label: "綿", value: "超長繊維コットン" },
  { label: "仕上げ", value: "手仕上げの襟" },
] as const;

export const PRICE_POSITIONING = {
  headline: "価格に含まれるもの",
  intro:
    "WHITE TEE の価格は、ブランクへのラベル貼りではなく、和歌山での自社編立て、生地ごとのゲージ調整、仕上げ工程に向けられています。",
  lines: [
    "最初のループより前に選ぶ、超長繊維コットン。",
    "和歌山工場での円編——重量ごとにゲージを調整。",
    "フラットロック縫製、型付けした襟、出荷前の検品。",
    "1枚のTシャツを12回改名したのではなく、6つのシルエット。",
  ],
  rangeTemplate:
    "素材・縫製・仕上げにこだわった一着。各商品ページに個別価格を表示。",
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
