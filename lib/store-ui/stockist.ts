import { getJournalArticles } from "@/lib/content/journal";
import type { JournalArticle } from "@/lib/content/journal-static";

export type StockistImage = {
  src: string;
  alt: string;
  caption: string;
};

export const STOCKIST_PAGE = {
  label: "Stockist",
  title: ["買える場所と、", "編んでいる場所。"],
  lead: "WHITE TEEは、このオンラインストアで販売しています。生地を編んでいるのは、和歌山市の工場です。",
  heroImage: {
    src: "/mill/floor.jpg",
    alt: "丸編機が並ぶ工場の編み場",
  },
} as const;

export const STOCKIST_STORE = {
  label: "Store",
  title: "オンラインストア",
  lines: [
    "3つのゲージ、2つのシルエット、S・M・Lの3サイズ。全6型をこのストアで販売しています。",
    "店頭での取り扱いが始まったら、このページでお知らせします。",
  ],
} as const;

/** Only facts confirmed for the mill. No phone, email or opening hours. */
export const STOCKIST_MILL = {
  label: "Mill",
  title: "編立工場",
  rows: [
    { label: "社名", value: "カネマサ莫大小株式会社" },
    { label: "所在地", value: "〒641-0007 和歌山県和歌山市小雑賀129" },
    { label: "創業", value: "1964年" },
  ],
  note: "取り扱いやご注文についてのご連絡は、お問い合わせページからお願いします。",
} as const;

export const STOCKIST_IMAGES: StockistImage[] = [
  {
    src: "/mill/cones.jpg",
    alt: "クリールに掛かった糸のコーン",
    caption: "糸",
  },
  {
    src: "/mill/crown.jpg",
    alt: "丸編機の上部に並ぶ給糸装置",
    caption: "編機",
  },
  {
    src: "/mill/takedown.jpg",
    alt: "編機の下で巻き取られていく編み上がった生地",
    caption: "生地",
  },
];

/** Journal entries about the mill floor and its yarn. */
export const STOCKIST_JOURNAL_SLUGS = [
  "circular-knitting-wakayama",
  "reading-jersey-by-hand",
  "from-cotton-to-yarn",
] as const;

export async function getStockistJournalArticles(): Promise<JournalArticle[]> {
  const articles = await getJournalArticles();
  return STOCKIST_JOURNAL_SLUGS.map((slug) =>
    articles.find((article) => article.slug === slug),
  ).filter((article): article is JournalArticle => article != null);
}
