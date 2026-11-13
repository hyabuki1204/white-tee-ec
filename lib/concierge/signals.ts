import type { ConciergeLanguage } from "@/lib/concierge/types";

/**
 * Deterministic reading of what a customer wrote.
 *
 * This is the rules path's only understanding of language: keyword and
 * number matching in Japanese and English. It is deliberately conservative —
 * a signal it does not recognise is ignored, never guessed.
 */

export type GaugeTag =
  | "alone"
  | "structure"
  | "sheer"
  | "jacket"
  | "drape"
  | "hot"
  | "thin"
  | "everyday"
  | "unsure"
  | "first";

export type Topic =
  | "shipping"
  | "returns"
  | "care"
  | "compare"
  | "thanks"
  | "greeting";

export type Signals = {
  heightCm?: number;
  weightKg?: number;
  usualSize?: "S" | "M" | "L" | "XL";
  solidBuild?: boolean;
  fit?: "fitted" | "roomy";
  /** Silhouette the customer named outright. */
  silhouette?: "Regular" | "Box";
  /** Gauge the customer named as the one they want. */
  wantedGauge?: number;
  /** Gauge they said they already own. */
  ownedGauge?: number;
  wantsSecond?: boolean;
  tags: GaugeTag[];
};

export type MessageReading = {
  signals: Signals;
  topics: Topic[];
  /** True when the message is about choosing a tee at all. */
  onTopic: boolean;
};

export const GAUGES = [28, 36, 46] as const;

/** Tag → gauge it argues for, and how strongly. */
export const TAG_VOTES: Record<GaugeTag, { gauge: number; weight: number }> = {
  alone: { gauge: 28, weight: 1 },
  structure: { gauge: 28, weight: 1 },
  // A sheerness worry is a constraint, not a preference: it outweighs one
  // opposing signal.
  sheer: { gauge: 28, weight: 2 },
  jacket: { gauge: 46, weight: 2 },
  drape: { gauge: 46, weight: 1 },
  hot: { gauge: 46, weight: 1 },
  thin: { gauge: 46, weight: 1 },
  everyday: { gauge: 36, weight: 1 },
  unsure: { gauge: 36, weight: 1 },
  first: { gauge: 36, weight: 1 },
};

const TAG_PATTERNS: Array<[GaugeTag, RegExp]> = [
  [
    "alone",
    /[一1１]枚で|単体|それだけで着|on its own|by itself|\balone\b|without (?:a )?(?:jacket|layer)|no jacket/i,
  ],
  [
    "structure",
    /ハリ|張り|しっかり|厚手|厚め|肉厚|ヘビー|型崩れ|structur|\bthick|heavy(?:weight)?|sturdy|\bcrisp|substantial|\bbeefy/i,
  ],
  [
    "sheer",
    /透け|すけ(?:る|な|て|感)|乳首|sheer|see[- ]?through|transparen|show(?:s|ing)? through/i,
  ],
  [
    "jacket",
    /ジャケット|インナー|重ね着|レイヤ|スーツ|カーディガン|シャツの下|羽織|\bjacket|\bblazer|\bsuit\b|layer|cardigan|under (?:a |my )?(?:shirt|sweater|knit)/i,
  ],
  ["drape", /落ち感|ドレープ|とろみ|なめらか|光沢|\bdrap|\bfluid|\bsilky|\bsheen/i],
  [
    "hot",
    /暑|夏|蒸し|猛暑|汗|涼し|\bhot\b|summer|humid|tropical|\bsweat|warm (?:weather|climate)/i,
  ],
  ["thin", /薄手|薄い|薄め|軽い|軽め|\bthin|light(?:weight)?\b|\bairy/i],
  [
    "everyday",
    /毎日|普段使い|普段着|デイリー|日常|オールシーズン|一年中|通年|every ?day|\bdaily|all[- ]year|year[- ]round|versatile/i,
  ],
  [
    "unsure",
    /迷|わから|分から|決められ|どれが|おまかせ|お任せ|not sure|unsure|don'?t know|no idea|can'?t decide|which (?:one|should)/i,
  ],
  [
    "first",
    /はじめて|初めて|最初の|[一1１]枚目|first (?:tee|t-?shirt|one|time)|my first/i,
  ],
];

const TOPIC_PATTERNS: Array<[Topic, RegExp]> = [
  [
    "shipping",
    /配送|送料|発送|届[くきけ]|お届け|いつ届|納期|shipping|\bship\b|deliver|postage|arrive/i,
  ],
  ["returns", /返品|交換|返金|キャンセル|\breturn|exchange|refund/i],
  [
    "care",
    /洗濯|洗い方|洗え|お手入れ|手入れ|乾燥機|アイロン|漂白|\bwash|laundry|\bdry(?:er|ing)?\b|\biron|bleach|\bcare\b/i,
  ],
  ["compare", /違い|ちがい|比較|比べ|どう違|difference|compare|\bversus\b|\bvs\.?\b/i],
  ["thanks", /ありがと|助かり|了解|thank|thanks|\bthx\b/i],
  // Only a message that is nothing but a greeting.
  [
    "greeting",
    /^\s*(?:こんにちは|こんばんは|おはよう(?:ございます)?|はじめまして|hello|hi|hey|good (?:morning|afternoon|evening))[\s!！。.、,]*$/i,
  ],
];

/** Anything here means the message is about tees, even with no hard signal. */
const ON_TOPIC =
  /tシャツ|ティーシャツ|\btee\b|t-?shirt|サイズ|\bsize|ゲージ|gauge|\b(?:28|36|46)\s?g\b|生地|素材|綿|コットン|fabric|cotton|天竺|jersey|シルエット|silhouette|レギュラー|regular|ボックス|\bbox\b|着丈|身幅|肩幅|袖|\bfit\b|フィット|在庫|stock|価格|値段|いくら|price|\bcost/i;

/**
 * Words that fit a tee question but fit anything else just as well
 * ("おすすめの映画は？"). They count only in a message short enough to be a
 * bare "おすすめは？" / "What do you recommend?".
 */
const WEAK_ON_TOPIC =
  /おすすめ|お勧め|recommend|suggest|相談|選[びぶべん]|着[るたてこ]|\bwear/i;
/** Japanese says the same thing in far fewer characters than English. */
const WEAK_MAX_CHARS = { cjk: 12, latin: 30 } as const;

function toHalfWidth(text: string): string {
  // NFKC folds full-width digits and letters, ㎝ → cm, ㎏ → kg.
  return text.normalize("NFKC");
}

function inRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

function readHeight(text: string): number | undefined {
  const labelled = text.match(/(?:身長|height)[^\d]{0,8}(\d{3}(?:\.\d)?)/i);
  const withUnit = text.match(/(\d{3}(?:\.\d)?)\s*(?:cm|センチ)/i);
  const paired = text.match(
    /(?:^|[^\d.])(1[3-9]\d|2[0-2]\d)\s*[/,、 ]\s*\d{2,3}(?:\.\d)?\s*(?:kg|キロ)/i,
  );
  const metric = Number(labelled?.[1] ?? withUnit?.[1] ?? paired?.[1]);

  if (inRange(metric, 130, 220)) return Math.round(metric);

  // 5'10", 5 ft 10, 5 feet 10 in
  const imperial = text.match(
    /\b([4-7])\s*(?:'|′|ft\b|feet\b|foot\b)\s*(\d{1,2})?/i,
  );

  if (imperial) {
    const cm = Number(imperial[1]) * 30.48 + Number(imperial[2] ?? 0) * 2.54;
    if (inRange(cm, 130, 220)) return Math.round(cm);
  }

  return undefined;
}

function readWeight(text: string): number | undefined {
  const labelled = text.match(/(?:体重|weight)[^\d]{0,8}(\d{2,3}(?:\.\d)?)/i);
  const withUnit = text.match(/(\d{2,3}(?:\.\d)?)\s*(?:kg|キロ)/i);
  const metric = Number(labelled?.[1] ?? withUnit?.[1]);

  if (inRange(metric, 30, 150)) return Math.round(metric);

  const pounds = text.match(/(\d{2,3})\s*(?:lbs?\b|pounds?\b)/i);

  if (pounds) {
    const kg = Number(pounds[1]) * 0.4536;
    if (inRange(kg, 30, 150)) return Math.round(kg);
  }

  return undefined;
}

const SIZE_WORDS: Record<string, "S" | "M" | "L" | "XL"> = {
  s: "S",
  small: "S",
  m: "M",
  medium: "M",
  l: "L",
  large: "L",
  xl: "XL",
  "x-large": "XL",
  "extra large": "XL",
};

function readUsualSize(text: string): Signals["usualSize"] {
  const SIZE = "(XL|S|M|L)";
  const patterns = [
    // 普段はM / いつもLサイズ
    new RegExp(`(?:普段|ふだん|いつも|通常|だいたい)[^。.\\n]{0,12}?\\b${SIZE}\\b`),
    // Mサイズ
    new RegExp(`\\b${SIZE}\\s*サイズ`),
    // size M / サイズはM
    new RegExp(`(?:size|サイズ)\\s*(?:は|が|:|is)?\\s*\\b${SIZE}\\b`, "i"),
    // usually wear a medium
    /(?:usual(?:ly)?|normal(?:ly)?|typical(?:ly)?|always|wear(?:ing)?|i'?m|i am|take)\s+(?:an?\s+)?(?:size\s+)?(x-large|extra large|small|medium|large|xl)\b/i,
    // I'm an M / wear a L (uppercase only, so the article "a" is not a size)
    /(?:wear|i'?m|I am|take)\s+(?:an?\s+)?(?:size\s+)?\b(XL|S|M|L)\b(?!')/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const size = match?.[1] && SIZE_WORDS[match[1].toLowerCase()];
    if (size) return size;
  }

  return undefined;
}

function readGaugeMentions(text: string): {
  wanted?: number;
  owned?: number;
} {
  const result: { wanted?: number; owned?: number } = {};
  const mention = /(28|36|46)\s*(?:g\b|ゲージ)/gi;

  for (const match of text.matchAll(mention)) {
    const gauge = Number(match[1]);
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 18);
    const before = text.slice(Math.max(0, match.index - 24), match.index);

    if (
      /^\s*(?:は|を|も|なら)?\s*(?:すでに|もう)?\s*(?:持って|もって|所有|愛用|買った|購入済)/.test(after) ||
      /(?:own|have|bought|got)\s+(?:an?\s+|the\s+|one\s+)?(?:in\s+)?$/i.test(before) ||
      /^\s*(?:already|tee already)/i.test(after)
    ) {
      result.owned = gauge;
    } else {
      result.wanted = gauge;
    }
  }

  return result;
}

/**
 * Reply language. Kana anywhere means Japanese; a message that is mostly
 * Latin letters with no kana or kanji is answered in English. Everything
 * else (kanji-only notes, numbers only) stays with the store default.
 */
export function detectLanguage(text: string): ConciergeLanguage {
  if (/[぀-ヿ]/.test(text)) return "ja";
  if (/[一-鿿]/.test(text)) return "ja";

  const letters = text.match(/[A-Za-z]/g)?.length ?? 0;
  return letters >= 3 ? "en" : "ja";
}

export function readMessage(raw: string): MessageReading {
  const text = toHalfWidth(raw);
  const signals: Signals = { tags: [] };

  const height = readHeight(text);
  const weight = readWeight(text);
  const usualSize = readUsualSize(text);

  if (height !== undefined) signals.heightCm = height;
  if (weight !== undefined) signals.weightKg = weight;
  if (usualSize) signals.usualSize = usualSize;

  if (
    /がっちり|がっしり|筋肉|肩幅が広|胸板|体格がい|大柄|ぽっちゃり|お腹|athletic|muscular|broad|stocky|\bbig (?:guy|build|chest|shoulders)|heavyset/i.test(
      text,
    )
  ) {
    signals.solidBuild = true;
  }

  if (
    /ゆったり|ゆるめ|ゆるく|大きめ|オーバーサイズ|ルーズ|リラックス|ビッグシルエット|\broomy|\brelaxed|\bloose|oversized?|\bbaggy/i.test(
      text,
    )
  ) {
    signals.fit = "roomy";
  } else if (
    /ジャスト|ぴったり|ピッタリ|フィット感|タイト|細身|すっきり|スリム|\bfitted|\bslim|\btight|\bsnug|close[- ]fitting|true to size/i.test(
      text,
    )
  ) {
    signals.fit = "fitted";
  }

  if (/ボックス|\bbox(?:y)?\b/i.test(text)) {
    signals.silhouette = "Box";
  } else if (/レギュラー|\bregular\b/i.test(text)) {
    signals.silhouette = "Regular";
  }

  const gauges = readGaugeMentions(text);
  if (gauges.wanted !== undefined) signals.wantedGauge = gauges.wanted;
  if (gauges.owned !== undefined) signals.ownedGauge = gauges.owned;

  if (
    /[2２二]枚目|買い足|もう[1１一]枚|追加で|second (?:tee|t-?shirt|one)|another (?:tee|t-?shirt|one)|add(?:ing)? (?:a |one )?(?:second|another)/i.test(
      text,
    )
  ) {
    signals.wantsSecond = true;
  }

  for (const [tag, pattern] of TAG_PATTERNS) {
    if (pattern.test(text)) signals.tags.push(tag);
  }

  const topics = TOPIC_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(
    ([topic]) => topic,
  );

  const hasSignal =
    signals.tags.length > 0 ||
    signals.heightCm !== undefined ||
    signals.weightKg !== undefined ||
    signals.usualSize !== undefined ||
    signals.fit !== undefined ||
    signals.silhouette !== undefined ||
    signals.wantedGauge !== undefined ||
    signals.ownedGauge !== undefined ||
    signals.solidBuild === true ||
    signals.wantsSecond === true;

  const onTopic =
    hasSignal ||
    topics.some((topic) => topic !== "thanks" && topic !== "greeting") ||
    ON_TOPIC.test(text) ||
    (WEAK_ON_TOPIC.test(text) &&
      text.trim().length <=
        (/[\u3040-\u30ff\u4e00-\u9fff]/.test(text)
          ? WEAK_MAX_CHARS.cjk
          : WEAK_MAX_CHARS.latin));

  return { signals, topics, onTopic };
}

/** Fold a conversation's customer messages into one picture; later wins. */
export function mergeSignals(all: Signals[]): Signals {
  const merged: Signals = { tags: [] };

  for (const signals of all) {
    const { tags, ...rest } = signals;
    Object.assign(merged, rest);

    for (const tag of tags) {
      if (!merged.tags.includes(tag)) merged.tags.push(tag);
    }
  }

  return merged;
}
