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
    label: "WAKAYAMA, JAPAN",
    headline: "和歌山で編んだ、3つのゲージの白Tシャツ。",
    subline: "28G・36G・46G × Regular / Box。全6型、S・M・L。",
    shopCta: "商品を見る",
  },
  proof: [
    {
      label: "透けにくさ",
      line: "28Gは目付240g/m²、1枚で着られる厚み。46Gは薄手でも、1インチに針46本の密度で支えます。",
    },
    {
      label: "形の残り方",
      line: "洗濯を重ねても首元と肩線が保たれるよう、襟と縫製に時間をかけています。",
    },
    {
      label: "選びやすさ",
      line: "3つのゲージ × 2つのシルエット。生地を決めて、形を選ぶだけです。",
    },
  ],
  detail: {
    caption: "代表モデルの着用例",
  },
  storySection: {
    label: "つくりについて",
    intro:
      "生地は和歌山・カネマサ莫大小で編んでいます。同じ機械でも、同じ生地は生まれない。購入前に知っておきたい要点だけ、ここにまとめました。",
    fabricCta: "生地を比較する",
    aboutCta: "ブランドについて",
  },
  story: [
    {
      key: "material",
      title: "Material",
      imageAlt: "白Tシャツの生地を拡大した写真",
      lines: [
        "40/2、60/1、80/1。糸の太さを変え、28・36・46の3つのゲージで編み分けています。",
        "目付は240、160、130g/m²。1枚で着る白から、ジャケットの下の白まで。",
      ],
      image: HOME_IMAGES.story.material,
    },
    {
      key: "finish",
      title: "Finish",
      imageAlt: "和歌山の丸編み工場の写真",
      lines: [
        "1964年創業、和歌山のカネマサ莫大小。36Gから46Gのハイゲージ丸編みを得意とする工場です。",
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
