/**
 * Static English for content that lives in the database in production.
 *
 * The database has no English columns (`products`, `fabrics`,
 * `site_content`). In English mode the storefront therefore takes its copy
 * from this module, keyed by slug, and keeps everything that is not language
 * (price, stock, images, dates, sizes) from the database.
 *
 * Consequence: edits made in the admin to product descriptions, fabric
 * taglines, journal articles and the about page appear on the Japanese site
 * only, until this module is updated to match.
 */
import { FABRICS, type Fabric } from "@/lib/fabric/content";
import type { Locale } from "@/lib/i18n/config";
import type { JournalArticle } from "@/lib/content/journal-static";
import type { Product } from "@/types";
import type { AboutPageContent } from "@/types/site-content";

/* —— Products —— */

type ProductEnglish = {
  description: string;
  detailDescription: string;
};

const REGULAR_LINE =
  "A standard silhouette: 54 cm across the chest and 70 cm long in size M.";
const BOX_LINE =
  "Size M is 60 cm across the chest and 67 cm long: a box shape, 6 cm wider and 3 cm shorter than the Regular.";

export const PRODUCT_CARE_EN =
  "Machine wash cold with like colours. Do not bleach. Tumble dry low. Cool iron if needed.";

export const PRODUCT_MATERIAL_EN = "100% cotton";

export const PRODUCT_EN_BY_SLUG: Record<string, ProductEnglish> = {
  "28g-regular-tee": {
    description:
      "A thick, tight-knit jersey in two-ply yarn. A white with body, to wear on its own.",
    detailDescription: `Tight-knit jersey in 40/2 combed cotton, knitted at 28 gauge. 240 g/m². The cloth is thick, has body, and is hard to see through. ${REGULAR_LINE}`,
  },
  "28g-box-tee": {
    description:
      "Thick 28G, cut wide in the body and short in length. A white that holds its shape.",
    detailDescription: `Tight-knit jersey in 40/2 combed cotton, knitted at 28 gauge. 240 g/m². The body of the cloth lets the shape stand. ${BOX_LINE}`,
  },
  "36g-regular-tee": {
    description: "Smooth, even 36G. The standard white, for every day.",
    detailDescription: `Tight-knit jersey in 60/1 compact cotton, knitted at 36 gauge. 160 g/m². Very little fuzz; the surface is smooth and even. ${REGULAR_LINE}`,
  },
  "36g-box-tee": {
    description: "The calm surface of 36G, in a roomy box shape.",
    detailDescription: `Tight-knit jersey in 60/1 compact cotton, knitted at 36 gauge. 160 g/m². A calm surface in a roomy shape. ${BOX_LINE}`,
  },
  "46g-regular-tee": {
    description:
      "46 needles per inch. A thin, dense white that sits under a jacket.",
    detailDescription: `Tight-knit jersey in 80/1 combed compact cotton, knitted at 46 gauge. 130 g/m². 46 needles per inch. Thin, but tightly knitted, it drapes like a woven cloth, with a restrained lustre. ${REGULAR_LINE}`,
  },
  "46g-box-tee": {
    description:
      "46G, the finest of the three, cut wide in the body. A white that drapes like a woven cloth.",
    detailDescription: `Tight-knit jersey in 80/1 combed compact cotton, knitted at 46 gauge. 130 g/m². 46 needles per inch. The thin, dense cloth falls straight from a wide body. ${BOX_LINE}`,
  },
};

/**
 * Product copy in the given locale. Names are never translated.
 * A product with no English entry gets empty descriptions rather than
 * Japanese text: its name, price, spec table and size guide still render.
 */
export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale !== "en") return product;

  const english = PRODUCT_EN_BY_SLUG[product.slug];

  return {
    ...product,
    description: english?.description ?? "",
    detailDescription: english?.detailDescription ?? "",
    material: PRODUCT_MATERIAL_EN,
    care: PRODUCT_CARE_EN,
  };
}

export function localizeProducts(
  products: Product[],
  locale: Locale,
): Product[] {
  return locale === "en"
    ? products.map((product) => localizeProduct(product, locale))
    : products;
}

/* —— Fabrics —— */

const FABRIC_EN_BY_SLUG = new Map(FABRICS.map((fabric) => [fabric.slug, fabric]));

/** English fabric copy comes from the static list; unknown slugs are dropped. */
export function localizeFabric(fabric: Fabric, locale: Locale): Fabric | null {
  if (locale !== "en") return fabric;

  const english = FABRIC_EN_BY_SLUG.get(fabric.slug);
  if (!english) return null;

  return {
    ...fabric,
    name: english.name,
    tagline: english.tagline,
    descriptionLines: english.descriptionLines,
    imageAlt: english.imageAlt,
    helperJa: null,
    taglineJa: null,
  };
}

export function localizeFabrics(fabrics: Fabric[], locale: Locale): Fabric[] {
  return fabrics
    .map((fabric) => localizeFabric(fabric, locale))
    .filter((fabric): fabric is Fabric => fabric !== null);
}

/* —— Journal —— */

type JournalEnglish = Pick<
  JournalArticle,
  "title" | "excerpt" | "heroImageAlt" | "body"
> & {
  /** Short topic shown beside the date. */
  topic: string;
};

export const JOURNAL_PAGE_EN = {
  pageTitle: "Journal",
  headline: "Notes from the mill.",
  introLines: [
    "Gauge, yarn, the knitting floor, washing.",
    "How a white T-shirt is made, and what happens once you wear it, in the mill's own words.",
  ] as [string, string],
};

export const JOURNAL_EN_BY_SLUG: Record<string, JournalEnglish> = {
  "circular-knitting-wakayama": {
    title: "From a knitting floor in Wakayama, home of circular knitting.",
    excerpt:
      "Wakayama is Japan's main centre for circular knitting. This is about the knitting floor of a mill founded in Wakayama City in 1964.",
    topic: "Knitting floor",
    heroImageAlt:
      "Needles lined up on the cylinder of a circular knitting machine, with the yarns converging",
    body: [
      "The cloth for WHITE TEE is knitted at a mill in Wakayama City. Wakayama is Japan's main centre for circular knitting, and the mill was founded in 1964.",
      "A circular knitting machine knits cloth into a tube, using needles set around a circle. Yarn runs from the cones above, through the feeders, to the needles. The finished cloth comes down below the machine.",
      "The mill's strength is high gauge: 36 to 46. The finer the needles, the more directly a slight difference in yarn tension or in the state of a needle shows in the cloth.",
      "The machines run automatically. Even so, whether the cloth turns out well depends on people. Yarn tension, the habits of each needle, the sound of the machine. The same machine never knits the same cloth twice.",
      "28, 36, 46. All three WHITE TEE gauges are knitted on this floor.",
    ],
  },
  "reading-jersey-by-hand": {
    title: "Reading gauge: 28, 36, 46.",
    excerpt:
      "Gauge is the number of needles per inch. Change the number, and the same 100% cotton white becomes a different cloth.",
    topic: "Gauge",
    heroImageAlt:
      "A circular knitting machine with needles around its circumference, and cloth being knitted",
    body: [
      "Gauge (G) describes how densely the needles are set on a knitting machine: how many needles sit in one inch, about 2.54 cm. At 28 gauge there are 28; at 46 gauge, 46.",
      "More needles mean smaller stitches and finer yarn. The cloth becomes thinner and denser, and its surface smoother. Fewer needles mean thicker yarn, and a cloth with thickness and body.",
      "WHITE TEE is knitted in three gauges. 28 gauge uses 40/2 combed two-ply yarn, 36 gauge uses 60/1 compact yarn, and 46 gauge uses 80/1 combed compact yarn. In a yarn count, the higher the number, the finer the yarn.",
      "28 gauge is a white with thickness and body, to wear on its own. 36 gauge is the standard white: smooth on the surface, wearable all year. 46 gauge is a thin, tightly knitted white that sits under a jacket.",
      "All three are 100% cotton, and all three are plain jersey. Only the gauge and the yarn differ. Feel the difference with your hands.",
    ],
  },
  "the-atelier-morning": {
    title: "Washing white.",
    excerpt:
      "A white T-shirt is a garment you wash as you wear it. These are the basics of washing, common to all three gauges.",
    topic: "Washing",
    heroImageAlt: "Finished cloth coming down from the knitting machine",
    body: [
      "A white T-shirt shows its difference after washing, not when you first put it on. Collar, hem, shoulder line. How they hold depends on how you wash.",
      "It can be machine-washed in cold water. Keep it apart from colours: colour transfer shows most on white. Do not use bleach.",
      "Turn it inside out and put it in a laundry net to reduce friction on the surface. After the spin, straighten the collar and shoulder line by hand before you hang it to dry.",
      "If you use a tumble dryer, keep the heat low. If it needs ironing, keep that low too.",
      "The gauges differ here as well. 28 gauge is a tight-knit two-ply jersey: its collar and shoulder line hold through repeated washing. 36 gauge is knitted from compact yarn with little fuzz, so the surface does not roughen in the wash. The drape and restrained lustre of 46 gauge are still there after washing.",
    ],
  },
  "from-cotton-to-yarn": {
    title: "White is decided by the yarn.",
    excerpt:
      "The character of a white is largely set before knitting begins. Count, twist, spinning method. This is about yarn.",
    topic: "Yarn",
    heroImageAlt: "Close-up of cones wound with undyed yarn",
    body: [
      "In white, the fuzz and twist of the yarn show directly on the surface. Nothing can be hidden behind colour or pattern, so the choice of yarn, before knitting, decides the character of the white.",
      "More than 60% of the yarn this mill uses is spun to order. For WHITE TEE too, the count and the spinning method change with each gauge.",
      "28 gauge uses 40/2 combed two-ply yarn. Combing is the step that removes short fibres with a comb. Two-ply means two yarns twisted together. The result has thickness and body.",
      "36 gauge uses 60/1 compact yarn. The fibres are condensed during spinning, which keeps the fuzz down. The knitted surface comes out even.",
      "46 gauge uses 80/1 combed compact yarn, the finest of the three. To knit with 46 needles per inch, the yarn has to be fine, with little fuzz.",
    ],
  },
};

/**
 * Journal entries in the given locale. In English, an entry with no English
 * counterpart is omitted rather than shown in Japanese. Date, order, hero
 * image and the featured flag still come from the stored entry.
 */
export function localizeJournalArticles(
  articles: JournalArticle[],
  locale: Locale,
): JournalArticle[] {
  if (locale !== "en") return articles;

  return articles.flatMap((article) => {
    const english = JOURNAL_EN_BY_SLUG[article.slug];
    if (!english) return [];

    return [
      {
        ...article,
        title: english.title,
        excerpt: english.excerpt,
        heroImageAlt: english.heroImageAlt,
        helperJa: english.topic,
        body: english.body,
      },
    ];
  });
}

export function hasEnglishJournalArticle(slug: string): boolean {
  return slug in JOURNAL_EN_BY_SLUG;
}

/* —— About (the mill page's closing statement) —— */

export const ABOUT_EN: Required<
  Pick<AboutPageContent, "headline" | "bodyParagraphs" | "helperJa">
> = {
  headline: "Between cloth and skin.",
  bodyParagraphs: [
    ["A white T-shirt is the simplest garment,", "and the hardest to make."],
    ["We knit our own cloth.", "Structure, cotton, air — in that order."],
    [
      "28, 36, 46: the number of needles per inch.",
      "The same machine never knits the same cloth twice.",
    ],
    ["A garment you forget you are wearing.", "Only the white itself remains."],
    [
      "A white T-shirt shows its difference after washing, not when you first put it on.",
      "Collar, hem, shoulder line — look at how they hold.",
    ],
  ],
  helperJa: "We make it from the cloth up, at our own mill in Wakayama.",
};
