export type JournalArticle = {
  slug: string;
  title: string;
  /** ISO date string for sorting and display */
  publishedAt: string;
  excerpt: string;
  heroImageUrl: string;
  heroImageAlt: string;
  /** Optional Japanese helper line under excerpt */
  helperJa?: string;
  /** Body paragraphs — editorial prose */
  body: readonly string[];
  featured?: boolean;
};

export const JOURNAL_PAGE_TITLE = "Journal";

export const JOURNAL_INTRO_LINES = [
  "Notes from the atelier.",
  "Cloth, machines, and the quiet work of white.",
] as const;

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "circular-knitting-wakayama",
    title: "Circular Knitting in Wakayama",
    publishedAt: "2025-11-12",
    excerpt:
      "Our jersey is knit on circular machines in Wakayama — loop by loop, at a pace the cloth can hold.",
    helperJa: "和歌山の丸編み機で、一枚の布を静かに編み上げる。",
    heroImageUrl: "/journal/journal-knitting-machine.jpg",
    heroImageAlt: "Circular knitting machine producing white cotton jersey",
    featured: true,
    body: [
      "WHITE TEE begins at the machine. Not in a sketchbook, not in a trend brief — at the needle, where yarn becomes cloth.",
      "We knit our own jersey in Wakayama on circular machines tuned for cotton. The gauge is chosen for white: enough body to hold shape, enough air to sit quietly on skin.",
      "Speed is not the point. A machine run too fast blurs the surface; too slow and the hand turns stiff. We listen to the cloth as it comes off the roll — weight, fall, how light moves across the loops.",
      "Every tee in the collection starts here. Same machines, same discipline. White, held in the knit from the first stitch.",
    ],
  },
  {
    slug: "reading-jersey-by-hand",
    title: "Reading Jersey by Hand",
    publishedAt: "2025-10-28",
    excerpt:
      "Weight, loop, and fall — how we choose a jersey before it becomes a tee.",
    helperJa: "手触りと目で、ジャージの表情を読み分ける。",
    heroImageUrl: "/journal/journal-jersey-texture.jpg",
    heroImageAlt: "Close-up of white cotton jersey knit texture",
    featured: true,
    body: [
      "Jersey is simple to name and difficult to read. Two surfaces, one structure — loops linked in a spiral that gives stretch without noise.",
      "We judge cloth with the hand first. Does it recover after a pinch? Does the surface stay even when held to light? Heavyweight jersey should feel dense but not dead; lightweight should be open without going sheer.",
      "White exposes everything. A uneven knit reads as shadow; a tight spin reads flat. We keep twelve jerseys in the line — each fabric in short and long sleeve, a different conversation between yarn, gauge, and air.",
      "When you choose a fabric on WHITE TEE, you are choosing how that conversation meets your body.",
    ],
  },
  {
    slug: "the-atelier-morning",
    title: "The Atelier Morning",
    publishedAt: "2025-09-15",
    excerpt:
      "Before cutting or sewing — light on the table, rolls of white, and the day arranged around cloth.",
    helperJa: "裁断の前。布と光で始まる一日。",
    heroImageUrl: "/journal/journal-atelier.jpg",
    heroImageAlt: "Quiet textile atelier with white fabric and soft window light",
    featured: true,
    body: [
      "The atelier opens to light before it opens to noise. Rolls of jersey are checked, marked, and laid out while the room is still calm.",
      "We work in small batches. Not as a marketing phrase — as a way to keep attention on each piece. A crooked fold in storage becomes a crooked seam at the shoulder. White forgives little.",
      "Tables stay clear. Tools stay few. The rhythm is cut, finish, inspect — then move on. Nothing rushed that the cloth would remember later.",
      "This is the atmosphere we want the tee to carry: ordered, quiet, ready to disappear into a wardrobe.",
    ],
  },
  {
    slug: "from-cotton-to-yarn",
    title: "From Cotton to Yarn",
    publishedAt: "2025-08-02",
    excerpt:
      "Long-staple cotton, spun fine — the raw material behind every white loop.",
    helperJa: "長繊維綿を、白い糸へ。",
    heroImageUrl: "/journal/journal-raw-cotton.jpg",
    heroImageAlt: "Raw cotton bales and white yarn cones in a textile studio",
    featured: false,
    body: [
      "White tee quality is decided long before the first stitch. The cotton must be clean, long-staple, and spun with enough twist to knit evenly without fuzz.",
      "We source yarn for clarity in white — not for bulk or shine. A good cone feels dry and even; it runs through the machine without catching or slubbing.",
      "Yarn rooms are kept simple: cones, labels, humidity checked. Material is boring on purpose. Boring means consistent.",
      "When the yarn is right, the jersey almost knits itself. When it is wrong, no amount of finishing will save the surface. We start strict so the tee can stay simple.",
    ],
  },
];

export function getJournalArticleBySlug(
  slug: string,
): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find((article) => article.slug === slug);
}

export function getFeaturedJournalArticles(limit = 3): JournalArticle[] {
  const featured = JOURNAL_ARTICLES.filter((article) => article.featured);
  const pool = featured.length >= limit ? featured : JOURNAL_ARTICLES;
  return [...pool]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}

export function getJournalSlugs(): string[] {
  return JOURNAL_ARTICLES.map((article) => article.slug);
}

export function formatJournalDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
