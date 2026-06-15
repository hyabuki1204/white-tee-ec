/** Japanese helper copy — short summaries, not translations. */

export const STORY_JA_HELPERS: Record<string, string> = {
  fabric:
    "自社で編んだジャージー。手触りと、白の見え方を大切にしています。",
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
  "heavyweight-jersey": {
    detailJa: "しっかりとした厚みと、形を保つハリのある生地。",
    taglineJa: "しっかりとした厚みのある生地",
  },
  "lightweight-jersey": {
    detailJa: "軽やかで、肌にやさしく息づく薄手の生地。",
    taglineJa: "軽く、肌にやわらかい生地",
  },
  "relaxed-jersey": {
    detailJa: "ゆとりのある落ち感。白は静かなまま。",
    taglineJa: "ゆとりある落ち感の生地",
  },
  "compact-jersey": {
    detailJa: "目の詰まった、ハリのあるコットンジャージー。",
    taglineJa: "目が詰まった、ハリのある生地",
  },
  "essential-jersey": {
    detailJa: "一年中使える、バランスの取れた定番の厚み。",
    taglineJa: "毎日使える定番の厚み",
  },
  "box-jersey": {
    detailJa: "密度の高い手触りと、フラットな表面。",
    taglineJa: "密度とフラットさのある生地",
  },
};

export const PRODUCT_SIZE_GUIDE_JA =
  "平置き採寸・cm表記。実寸は多少の誤差があります。";

export function getStoryJaHelper(storyId: string): string | null {
  return STORY_JA_HELPERS[storyId] ?? null;
}

export function getFabricJaCopy(slug: string): FabricJaCopy | null {
  return FABRIC_JA_BY_SLUG[slug] ?? null;
}
