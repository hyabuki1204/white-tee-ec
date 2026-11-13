import type { Locale } from "@/lib/i18n/config";
import { defineCopy, type Localized } from "@/lib/i18n/define-copy";

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
const WEARING_NOTES: Localized<WearingNote[]> = {
  ja: [
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
  ],
  en: [
    {
      fabric: "28G Jersey",
      months: 8,
      lines: [
        "Tight-knit two-ply. The collar and shoulder line hold through repeated washing.",
        "The surface softens a little. The thickness and body stay.",
      ],
    },
    {
      fabric: "36G Jersey",
      months: 6,
      lines: [
        "Compact yarn has little fuzz. The surface does not roughen in the wash.",
        "The thickness does not change. Only the hand settles in a little.",
      ],
    },
    {
      fabric: "46G Jersey",
      months: 6,
      lines: [
        "Thin, but tightly knitted, so the hem and cuffs resist stretching.",
        "The drape and restrained lustre are still there after washing.",
      ],
    },
  ],
};

export function getWearingNotes(locale: Locale): WearingNote[] {
  return WEARING_NOTES[locale];
}

export const getFacts = defineCopy(
  [
    { label: "工場", value: "和歌山・カネマサ莫大小（1964年創業）" },
    { label: "生地", value: "3つのゲージ — 28G / 36G / 46G" },
    { label: "形", value: "2つのシルエット — Regular / Box" },
    { label: "サイズ", value: "S / M / L" },
  ],
  [
    { label: "Mill", value: "Kanemasa Knitting, Wakayama (founded 1964)" },
    { label: "Cloth", value: "Three gauges — 28G / 36G / 46G" },
    { label: "Shape", value: "Two silhouettes — Regular / Box" },
    { label: "Sizes", value: "S / M / L" },
  ],
);

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
  locale: Locale,
): WearingNote | null {
  const notes = getWearingNotes(locale);

  if (!fabricName) return notes[0] ?? null;

  return (
    notes.find(
      (note) => note.fabric.toLowerCase() === fabricName.toLowerCase(),
    ) ??
    notes.find((note) =>
      fabricName.toLowerCase().includes(note.fabric.split(" ")[0]!.toLowerCase()),
    ) ??
    notes[0] ??
    null
  );
}
