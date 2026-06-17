import { JOURNAL_ARTICLES } from "@/lib/content/journal";

export type StockistImage = {
  src: string;
  alt: string;
  caption?: string;
};

export const STOCKIST_PAGE = {
  title: "Stockist",
  heroImage: {
    src: "/stockist/stockist-hero.jpg",
    alt: "Kanemasa textile factory exterior in Wakayama",
  },
  intro: [
    "Our factory in Wakayama — where WHITE TEE jersey is knit, finished, and prepared for the atelier.",
    "Kanemasa has worked with circular knitting for decades. The machines are ours; the pace is set by the cloth.",
  ],
  helperJa: "和歌山・金政の自社工場。WHITE TEEの生地はここから。",
} as const;

export const STOCKIST_STORY = {
  title: "The factory",
  paragraphs: [
    "Kanemasa sits in Wakayama Prefecture, south of Osaka — a region long associated with textile work and the patience it requires.",
    "We knit our own jersey here on circular machines tuned for cotton. Each run is checked for weight, surface, and recovery before it leaves the floor.",
    "The factory is not a showroom. It is a working room: yarn, machines, light, and the quiet rhythm of loops forming cloth.",
  ],
} as const;

export const STOCKIST_IMAGES: StockistImage[] = [
  {
    src: "/stockist/stockist-factory.jpg",
    alt: "Knitting floor with circular machines producing white jersey",
    caption: "Knitting floor",
  },
  {
    src: "/stockist/stockist-machines.jpg",
    alt: "Close view of circular knitting machine needles and yarn",
    caption: "Our machines",
  },
  {
    src: "/stockist/stockist-atelier.jpg",
    alt: "Yarn and cotton in the Wakayama atelier",
    caption: "Yarn room",
  },
];

export const STOCKIST_CONTACT = {
  title: "Visit & contact",
  name: "Kanemasa Co., Ltd.",
  addressLines: [
    "2-14-3 Higashi-Wada",
    "Wakayama City, Wakayama 640-8342",
    "Japan",
  ],
  helperJa: "工場見学は事前のご連絡をお願いしています。",
  email: "hello@white-tee.jp",
  phone: "+81-73-000-0000",
  hours: "Mon–Fri, 9:00–17:00 JST (by appointment)",
  mapNote:
    "The factory is not open for walk-in visits. Please contact us to arrange a tour or wholesale inquiry.",
} as const;

/** Journal entries related to the factory and atelier. */
export const STOCKIST_JOURNAL_SLUGS = [
  "circular-knitting-wakayama",
  "the-atelier-morning",
  "from-cotton-to-yarn",
] as const;

export function getStockistJournalArticles() {
  return STOCKIST_JOURNAL_SLUGS.map((slug) =>
    JOURNAL_ARTICLES.find((article) => article.slug === slug),
  ).filter((article): article is NonNullable<typeof article> => article != null);
}
