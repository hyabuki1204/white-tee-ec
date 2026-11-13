/** Japanese helper copy — short summaries, not translations. */

export const STORY_JA_HELPERS: Record<string, string> = {
  fabric:
    "和歌山で編んだ天竺。28・36・46、3つのゲージで白の見え方が変わります。",
  structure: "一本一本の糸が形を支える、静かな構造です。",
  air: "糸と肌の間に、最初から空気を織り込んでいます。",
  process: "和歌山の自社工場で、ゆっくりと編み立てています。",
};

export const ABOUT_JA_HELPER =
  "和歌山の自社工場で、生地から作っています。";

export type FabricJaCopy = {
  detailJa: string;
  taglineJa: string;
};

export const FABRIC_JA_BY_SLUG: Record<string, FabricJaCopy> = {
  "28g-jersey": {
    detailJa: "40/2の双糸を28ゲージで詰めて編んだ、肉厚でハリのある天竺。",
    taglineJa: "形が立つ、肉厚の白",
  },
  "36g-jersey": {
    detailJa: "60/1のコンパクト糸を36ゲージで。滑らかで偏りのない天竺。",
    taglineJa: "毎日着る、基準の白",
  },
  "46g-jersey": {
    detailJa: "80/1の糸を46ゲージで。薄く、密で、布帛のように落ちる天竺。",
    taglineJa: "薄く、密な白",
  },
};

export const PRODUCT_SIZE_GUIDE_JA =
  "平置き採寸・cm表記。実寸は多少の誤差があります。";

/** Fabric Character trait labels — subordinate to English in UI. */
export const FABRIC_CHARACTER_JA = {
  thickness: "厚み",
  softness: "やわらかさ",
  structure: "ハリ",
  sheerness: "透け感",
  surface: "表面感",
} as const;

export function getStoryJaHelper(storyId: string): string | null {
  return STORY_JA_HELPERS[storyId] ?? null;
}

export function getFabricJaCopy(slug: string): FabricJaCopy | null {
  return FABRIC_JA_BY_SLUG[slug] ?? null;
}
