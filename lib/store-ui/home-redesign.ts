import { HOME_FEATURED_PRODUCT_SLUG } from "@/lib/store-ui/home-featured";

export const HOME_IMAGES = {
  story: {
    material: "/home/story/material.png",
    finish: "/home/story/finish.png",
  },
} as const;

export const HOME_COPY = {
  hero: {
    lines: [
      "White tees in six jersey weights.",
      "Knit in Wakayama — slim to boxy.",
      "One standard: material, pattern, finish.",
    ],
  },
  proof: [
    {
      label: "透けにくさ",
      line: "生地ごとに厚みと編み密度を調整。1枚着でも安心できる白。",
    },
    {
      label: "形の残り方",
      line: "洗濯を重ねても首元と肩線が保たれるよう、襟と縫製に時間をかけています。",
    },
    {
      label: "選びやすさ",
      line: "6種類のジャージー × 6つのシルエット。体型と着方から選べます。",
    },
  ],
  detail: {
    caption: "代表モデルの着用例",
  },
  story: [
    {
      key: "material",
      title: "素材",
      lines: ["超長繊維コットン。", "6つの重量。"],
      image: HOME_IMAGES.story.material,
    },
    {
      key: "finish",
      title: "仕上げ",
      lines: ["和歌山。", "手仕上げ。"],
      image: HOME_IMAGES.story.finish,
    },
  ],
  cta: {
    label: "詳しく見る",
    productSlug: HOME_FEATURED_PRODUCT_SLUG,
  },
} as const;
