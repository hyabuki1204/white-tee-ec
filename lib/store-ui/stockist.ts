import { getJournalArticles } from "@/lib/content/journal";
import type { JournalArticle } from "@/lib/content/journal-static";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";

export const STOCKIST_HERO_IMAGE = "/mill/floor.jpg";

const STOCKIST_IMAGE_SOURCES = [
  "/mill/cones.jpg",
  "/mill/crown.jpg",
  "/mill/takedown.jpg",
] as const;

/** The mill's registered name and address, as written in Japanese. */
export const MILL_LEGAL_NAME_JA = "カネマサ莫大小株式会社";
export const MILL_LEGAL_NAME_EN = "Kanemasa Knitting Co., Ltd.";
export const MILL_ADDRESS_JA = "〒641-0007 和歌山県和歌山市小雑賀129";
export const MILL_ADDRESS_EN =
  "129 Kozaika, Wakayama City, Wakayama 641-0007, Japan";

/**
 * Only facts confirmed for the mill. No phone, email or opening hours.
 * `kind` lets the page mark up the address and, in English, show the
 * Japanese original beside the English version.
 */
export const getStockistCopy = defineCopy(
  {
    page: {
      label: "Stockist",
      title: ["買える場所と、", "編んでいる場所。"],
      lead: "WHITE TEEは、このオンラインストアで販売しています。生地を編んでいるのは、和歌山市の工場です。",
      heroAlt: "丸編機が並ぶ工場の編み場",
    },
    store: {
      label: "Store",
      title: "オンラインストア",
      lines: [
        "3つのゲージ、2つのシルエット、S・M・Lの3サイズ。全6型をこのストアで販売しています。",
        "店頭での取り扱いが始まったら、このページでお知らせします。",
      ],
      viewCollection: "コレクションを見る",
      chooseByGauge: "ゲージから選ぶ",
    },
    mill: {
      label: "Mill",
      title: "編立工場",
      rows: [
        { kind: "name", label: "社名", value: MILL_LEGAL_NAME_JA },
        { kind: "address", label: "所在地", value: MILL_ADDRESS_JA },
        { kind: "founded", label: "創業", value: "1964年" },
      ],
      note: "取り扱いやご注文についてのご連絡は、お問い合わせページからお願いします。",
      contact: "お問い合わせ",
      about: "工場について",
    },
    images: [
      { alt: "クリールに掛かった糸のコーン", caption: "糸" },
      { alt: "丸編機の上部に並ぶ給糸装置", caption: "編機" },
      { alt: "編機の下で巻き取られていく編み上がった生地", caption: "生地" },
    ],
    journal: {
      label: "Journal",
      title: "工場からの記録。",
      all: "記事一覧",
    },
  },
  {
    page: {
      label: "Stockist",
      title: ["Where to buy it,", "and where it is knitted."],
      lead: "WHITE TEE is sold in this online store. The cloth is knitted at a mill in Wakayama City.",
      heroAlt: "The knitting floor of the mill, lined with circular knitting machines",
    },
    store: {
      label: "Store",
      title: "Online store",
      lines: [
        "Three gauges, two silhouettes, three sizes: S, M and L. All six pieces are sold in this store.",
        "We currently ship within Japan only.",
        "When shops begin to carry WHITE TEE, we will announce it on this page.",
      ],
      viewCollection: "View the collection",
      chooseByGauge: "Choose by gauge",
    },
    mill: {
      label: "Mill",
      title: "The knitting mill",
      rows: [
        { kind: "name", label: "Company", value: MILL_LEGAL_NAME_EN },
        { kind: "address", label: "Address", value: MILL_ADDRESS_EN },
        { kind: "founded", label: "Founded", value: "1964" },
      ],
      note: "For enquiries about stocking or orders, please use the contact page.",
      contact: "Contact",
      about: "About the mill",
    },
    images: [
      { alt: "Cones of yarn on the creel", caption: "Yarn" },
      {
        alt: "Yarn feeders lined up on top of a circular knitting machine",
        caption: "Machine",
      },
      {
        alt: "Finished cloth being wound up beneath the knitting machine",
        caption: "Cloth",
      },
    ],
    journal: {
      label: "Journal",
      title: "Notes from the mill.",
      all: "All entries",
    },
  },
);

export function getStockistImages(locale: Locale) {
  return getStockistCopy(locale).images.map((image, index) => ({
    ...image,
    src: STOCKIST_IMAGE_SOURCES[index]!,
  }));
}

/** Journal entries about the mill floor and its yarn. */
export const STOCKIST_JOURNAL_SLUGS = [
  "circular-knitting-wakayama",
  "reading-jersey-by-hand",
  "from-cotton-to-yarn",
] as const;

export async function getStockistJournalArticles(
  locale: Locale,
): Promise<JournalArticle[]> {
  const articles = await getJournalArticles(locale);

  return STOCKIST_JOURNAL_SLUGS.map((slug) =>
    articles.find((article) => article.slug === slug),
  ).filter((article): article is JournalArticle => article != null);
}
