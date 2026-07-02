export type JournalArticle = {
  slug: string;
  title: string;
  titleJa: string;
  /** ISO date string for sorting and display */
  publishedAt: string;
  excerpt: string;
  excerptJa: string;
  heroImageUrl: string;
  heroImageAlt: string;
  /** Body paragraphs — English */
  body: readonly string[];
  /** Body paragraphs — Japanese */
  bodyJa: readonly string[];
  featured?: boolean;
};

export const JOURNAL_PAGE_TITLE = "Journal";

export const JOURNAL_INTRO_LINES = [
  "Notes from the atelier.",
  "Cloth, machines, and the quiet work of white.",
] as const;

export const JOURNAL_INTRO_LINES_JA = [
  "アトリエからの記録。",
  "布、機械、白の静かな仕事。",
] as const;

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "circular-knitting-wakayama",
    title: "Circular Knitting in Wakayama",
    titleJa: "和歌山の丸編み",
    publishedAt: "2025-11-12",
    excerpt:
      "Our jersey is knit on circular machines in Wakayama — loop by loop, at a pace the cloth can hold.",
    excerptJa: "和歌山の丸編み機で、ループを一つずつ。布が受け止められる速度で編み上げます。",
    heroImageUrl: "/journal/journal-knitting-machine.jpg",
    heroImageAlt: "Circular knitting machine producing white cotton jersey",
    featured: true,
    body: [
      "WHITE TEE begins at the machine. Not in a sketchbook, not in a trend brief — at the needle, where yarn becomes cloth.",
      "We knit our own jersey in Wakayama on circular machines tuned for cotton. The gauge is chosen for white: enough body to hold shape, enough air to sit quietly on skin.",
      "Speed is not the point. A machine run too fast blurs the surface; too slow and the hand turns stiff. We listen to the cloth as it comes off the roll — weight, fall, how light moves across the loops.",
      "Every tee in the collection starts here. Same machines, same discipline. White, held in the knit from the first stitch.",
    ],
    bodyJa: [
      "WHITE TEEは、スケッチブックでもトレンドブリーフでもなく——針のところ、糸が布になる場所から始まります。",
      "私たちは和歌山で、綿向けに調整した丸編み機でジャージーを自社編みしています。ゲージは白のため——形を保つ十分なボディ感と、肌に静かにのる十分な空気。",
      "速さが要点ではありません。速すぎれば表面がにじみ、遅すぎれば手触りが硬くなる。ロールから降りてくる布を聞く——重さ、落ち感、光がループをどう渡るか。",
      "コレクションのすべてのTシャツはここから始まります。同じ機械、同じ規律。最初の一針から編み込まれた白。",
    ],
  },
  {
    slug: "reading-jersey-by-hand",
    title: "Reading Jersey by Hand",
    titleJa: "手で読むジャージー",
    publishedAt: "2025-10-28",
    excerpt:
      "Weight, loop, and fall — how we choose a jersey before it becomes a tee.",
    excerptJa: "重さ、ループ、落ち感——Tシャツになる前に、生地を選ぶ方法。",
    heroImageUrl: "/journal/journal-jersey-texture.jpg",
    heroImageAlt: "Close-up of white cotton jersey knit texture",
    featured: true,
    body: [
      "Jersey is simple to name and difficult to read. Two surfaces, one structure — loops linked in a spiral that gives stretch without noise.",
      "We judge cloth with the hand first. Does it recover after a pinch? Does the surface stay even when held to light? Heavyweight jersey should feel dense but not dead; lightweight should be open without going sheer.",
      "White exposes everything. A uneven knit reads as shadow; a tight spin reads flat. We keep twelve jerseys in the line — each fabric in short and long sleeve, a different conversation between yarn, gauge, and air.",
      "When you choose a fabric on WHITE TEE, you are choosing how that conversation meets your body.",
    ],
    bodyJa: [
      "ジャージーは名付けるのは簡単で、読むのは難しい。二つの面、一つの構造——ノイズなく伸びを与える螺旋状に連なるループ。",
      "布はまず手で判断します。つまんで離したら戻るか。光にかざしたとき表面は均一か。ヘビーウェイトは密度があるが死んでいない；ライトウェイトは開いているが透けすぎない。",
      "白はすべてをさらします。不均一な編みは影に、きつい撚りは平らに見えます。12のジャージーをラインに——各生地を半袖と長袖で、糸、ゲージ、空気の異なる対話。",
      "WHITE TEEで生地を選ぶとき、それはその対話があなたの身体とどう出会うかを選ぶことです。",
    ],
  },
  {
    slug: "the-atelier-morning",
    title: "The Atelier Morning",
    titleJa: "アトリエの朝",
    publishedAt: "2025-09-15",
    excerpt:
      "Before cutting or sewing — light on the table, rolls of white, and the day arranged around cloth.",
    excerptJa: "裁断や縫製の前——テーブルに落ちる光、白い布、布を中心に始まる一日。",
    heroImageUrl: "/journal/journal-atelier.jpg",
    heroImageAlt: "Quiet textile atelier with white fabric and soft window light",
    featured: true,
    body: [
      "The atelier opens to light before it opens to noise. Rolls of jersey are checked, marked, and laid out while the room is still calm.",
      "We work in small batches. Not as a marketing phrase — as a way to keep attention on each piece. A crooked fold in storage becomes a crooked seam at the shoulder. White forgives little.",
      "Tables stay clear. Tools stay few. The rhythm is cut, finish, inspect — then move on. Nothing rushed that the cloth would remember later.",
      "This is the atmosphere we want the tee to carry: ordered, quiet, ready to disappear into a wardrobe.",
    ],
    bodyJa: [
      "アトリエは騒音より先に光に開きます。部屋がまだ静かなうちに、ジャージーのロールを確認し、印を付け、広げます。",
      "小ロットで仕事をします。マーケティングフレーズではなく——各一枚への注意を保つ方法として。保管の乱れた折り目は肩の乱れた縫い目になる。白はほとんど許さない。",
      "テーブルは空に、道具は少なく。リズムは裁断、仕上げ、検品——そして次へ。布が後で覚えているような急ぎはしない。",
      "Tシャツに持たせたい雰囲気はこれです：整然と、静かで、ワードローブの中で消える準備ができている。",
    ],
  },
  {
    slug: "from-cotton-to-yarn",
    title: "From Cotton to Yarn",
    titleJa: "綿から糸へ",
    publishedAt: "2025-08-02",
    excerpt:
      "Long-staple cotton, spun fine — the raw material behind every white loop.",
    excerptJa: "長繊維綿を、白いループのはじまりとなる糸へ。",
    heroImageUrl: "/journal/journal-raw-cotton.jpg",
    heroImageAlt: "Raw cotton bales and white yarn cones in a textile studio",
    featured: false,
    body: [
      "White tee quality is decided long before the first stitch. The cotton must be clean, long-staple, and spun with enough twist to knit evenly without fuzz.",
      "We source yarn for clarity in white — not for bulk or shine. A good cone feels dry and even; it runs through the machine without catching or slubbing.",
      "Yarn rooms are kept simple: cones, labels, humidity checked. Material is boring on purpose. Boring means consistent.",
      "When the yarn is right, the jersey almost knits itself. When it is wrong, no amount of finishing will save the surface. We start strict so the tee can stay simple.",
    ],
    bodyJa: [
      "白Tの品質は最初の一縫いよりずっと前に決まります。綿は清潔で、長繊維で、毛羽なく均一に編める十分な撚りで纺がれなければならない。",
      "糸は白の鮮やかさのために調達します——ボリュームや光沢のためではない。良いコーンは乾いて均一；機械を引っかけず、スラブなく走る。",
      "糸の部屋はシンプルに：コーン、ラベル、湿度管理。素材はわざと退屈に。退屈は一貫を意味する。",
      "糸が正しければ、ジャージーはほぼ自ら編まれる。間違っていれば、いくら仕上げても表面は救えない。Tシャツをシンプルに保てるよう、厳しく始める。",
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
