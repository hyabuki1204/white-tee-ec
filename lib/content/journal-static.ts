export type JournalArticle = {
  slug: string;
  title: string;
  /** ISO date string for sorting and display */
  publishedAt: string;
  excerpt: string;
  heroImageUrl: string;
  heroImageAlt: string;
  /** Optional short topic line shown beside the date */
  helperJa?: string;
  /** Body paragraphs — editorial prose */
  body: readonly string[];
  featured?: boolean;
};

export const JOURNAL_PAGE_TITLE = "Journal";

export const JOURNAL_PAGE_HEADLINE_JA = "工場からの記録。";

export const JOURNAL_INTRO_LINES = [
  "ゲージ、糸、編み場、洗い方。",
  "白いTシャツができるまでと、着てからのことを、工場の言葉で書いています。",
] as const;

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "circular-knitting-wakayama",
    title: "丸編みの産地、和歌山の編み場から。",
    publishedAt: "2025-11-12",
    excerpt:
      "和歌山は、日本の丸編みニットの主産地です。その和歌山市で1964年に創業した工場の、編み場の話。",
    helperJa: "編み場",
    heroImageUrl: "/mill/needle.jpg",
    heroImageAlt: "丸編機のシリンダーに並ぶ針と、集まっていく糸",
    featured: true,
    body: [
      "WHITE TEEの生地は、和歌山市の工場で編んでいます。和歌山は日本の丸編みニットの主な産地で、工場の創業は1964年です。",
      "丸編機は、円周に並んだ針で、生地を筒状に編んでいく機械です。糸は上に並んだコーンから給糸口を通って針に届き、編み上がった生地は機械の下へ下りていきます。",
      "この工場が得意としているのは、36ゲージから46ゲージのハイゲージです。針が細かくなるほど、糸の張りや針の状態のわずかな違いが、そのまま編地に出ます。",
      "機械は自動で動きます。それでも、いい生地になるかどうかは人で決まります。糸の張り、針のクセ、耳で聞く機械の音。同じ機械でも、同じ生地は生まれません。",
      "28、36、46。WHITE TEEの3つのゲージは、すべてこの編み場で編んでいます。",
    ],
  },
  {
    slug: "reading-jersey-by-hand",
    title: "ゲージを読む。28、36、46。",
    publishedAt: "2025-10-28",
    excerpt:
      "ゲージは、1インチあたりの針の本数です。数字が変わると、同じ綿100%の白が別の生地になります。",
    helperJa: "ゲージ",
    heroImageUrl: "/mill/ring.jpg",
    heroImageAlt: "針が円周に並ぶ丸編機と、編み上がっていく生地",
    featured: true,
    body: [
      "ゲージ（G）は、編機の針の密度を表す数字です。1インチ、約2.54cmの間に針が何本並んでいるか。28ゲージなら28本、46ゲージなら46本です。",
      "針が増えると編目は細かくなり、使う糸は細くなります。生地は薄く、密に、表面はなめらかになります。針が少なければ、太い糸で、厚みとハリのある生地になります。",
      "WHITE TEEは3つのゲージで編み分けています。28ゲージには40/2のコーマ双糸、36ゲージには60/1のコンパクト糸、46ゲージには80/1のコーマコンパクト糸。糸の番手は、数字が大きいほど細くなります。",
      "28ゲージは、厚みとハリのある一枚で着るための白。36ゲージは、表面が滑らかで一年を通して着られる基準の白。46ゲージは、薄く目の詰まった、ジャケットの下に収まる白です。",
      "素材はどれも綿100%、組織はどれも天竺です。違うのはゲージと糸だけ。その差を、手で触って確かめてみてください。",
    ],
  },
  {
    slug: "the-atelier-morning",
    title: "白を、洗う。",
    publishedAt: "2025-09-15",
    excerpt:
      "白いTシャツは、洗いながら着る服です。3つのゲージに共通する、洗い方の基本をまとめました。",
    helperJa: "洗い方",
    heroImageUrl: "/mill/fabric.jpg",
    heroImageAlt: "編機から下りてくる編み上がった生地",
    featured: true,
    body: [
      "白いTシャツは、着た瞬間より洗った後に差が出ます。首元、裾、肩線。洗い方で、その残り方が変わります。",
      "洗濯機で、水で洗えます。色物とは分けてください。白は色移りがいちばん目立ちます。漂白剤は使いません。",
      "裏返して洗濯ネットに入れると、表面の摩擦が減ります。脱水のあとは、首元と肩線を手で整えてから干してください。",
      "乾燥機を使う場合は低温で。アイロンが必要なときも低温です。",
      "ゲージによる違いもあります。28ゲージは双糸の度詰で、洗濯を重ねても首元と肩線が崩れにくい生地です。36ゲージはコンパクト糸の毛羽が少なく、洗っても表面が荒れにくい。46ゲージの落ち感と控えめな光沢は、洗った後も残ります。",
    ],
  },
  {
    slug: "from-cotton-to-yarn",
    title: "白は、糸で決まる。",
    publishedAt: "2025-08-02",
    excerpt:
      "編む前に、白の表情はほぼ決まっています。番手、撚り、紡績方法。糸の話です。",
    helperJa: "糸",
    heroImageUrl: "/mill/yarn.jpg",
    heroImageAlt: "生成りの糸を巻いたコーンの拡大",
    featured: false,
    body: [
      "白は、糸の毛羽と撚りがそのまま表面に出ます。色や柄で隠せないぶん、編む前の糸選びで白の表情が決まります。",
      "この工場で使う糸は、6割以上が別注で紡いだ糸です。WHITE TEEでも、ゲージごとに番手と紡績方法を変えています。",
      "28ゲージは40/2のコーマ双糸。コーマは、短い繊維を櫛で取り除く工程のこと。双糸は、2本の糸を撚り合わせた糸です。太さとハリが出ます。",
      "36ゲージは60/1のコンパクト糸。紡績の段階で繊維を集束させ、毛羽を抑えた糸です。編地の表面が均一になります。",
      "46ゲージは80/1のコーマコンパクト糸。3つのなかでいちばん細い糸です。1インチに46本の針で編むには、細く、毛羽の少ない糸が要ります。",
    ],
  },
];

/** "2025.11.12" — set in the Latin face with tabular numerals. */
export function formatJournalDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return year && month && day ? `${year}.${month}.${day}` : isoDate;
}
