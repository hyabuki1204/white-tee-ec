import { HOME_FEATURED_PRODUCT_SLUG } from "@/lib/store-ui/home-featured";
import { CREDIBILITY_IMAGES } from "@/lib/store-ui/credibility";
import { PDP_VALUE_IMAGES } from "@/lib/store-ui/pdp-value";

export const HOME_IMAGES = {
  story: {
    material: PDP_VALUE_IMAGES.fabric,
    finish: CREDIBILITY_IMAGES.factory,
  },
} as const;

export const HOME_COPY = {
  hero: {
    lines: [
      "和歌山で編んだ、6種類の白Tシャツ。",
      "袖丈とシルエットで選べる12モデル。",
      "¥12,000〜 — 素材・縫製・仕上げにこだわった一着。",
    ],
    shopCta: "商品を見る",
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
  storySection: {
    label: "つくりについて",
    intro:
      "生地の選定から仕上げまで、和歌山の工場で一貫して行っています。購入前に知っておきたい要点だけ、ここにまとめました。",
    fabricCta: "生地を比較する",
    aboutCta: "ブランドについて",
  },
  story: [
    {
      key: "material",
      title: "Material",
      imageAlt: "白Tシャツの生地を拡大した写真",
      lines: [
        "超長綿から選んだ糸を、6段階のジャージー重量で編み上げ。",
        "1枚着用から重ね着まで、用途に合わせて選べます。",
      ],
      image: HOME_IMAGES.story.material,
    },
    {
      key: "finish",
      title: "Finish",
      imageAlt: "和歌山の円筒編み工場の写真",
      lines: [
        "和歌山・Kanemasa の円筒編み機で編み、手仕上げで襟と裾を整えます。",
        "白は、着たあとの首元と肩線で品質がわかります。",
      ],
      image: HOME_IMAGES.story.finish,
    },
  ],
  cta: {
    label: "すべての商品を見る",
    productSlug: HOME_FEATURED_PRODUCT_SLUG,
  },
} as const;
