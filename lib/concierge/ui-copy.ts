import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import { defineCopy } from "@/lib/i18n/define-copy";

export type ConciergeChipGroup = {
  label: string;
  /** Only one chip of the group can be on at a time. */
  exclusive: boolean;
  chips: string[];
};

/**
 * Concierge UI copy.
 *
 * The chips are not only labels: the chosen ones are joined into the message
 * that is sent, so each one is worded to be read by the rules engine
 * (lib/concierge/signals.ts) in its own language.
 */
export const getConciergeCopy = defineCopy(
  {
    label: "Concierge",
    title: "どのゲージを、どのサイズで。",
    lead: "3つのゲージ、2つのシルエット、3つのサイズ。身長と着方から、18通りのうちの一枚をご案内します。",
    metaTitle: "サイズとゲージの相談",
    metaDescription:
      "身長と着方から、28G・36G・46Gのどのゲージを、どのシルエットとサイズで着るかをご案内します。",
    backTo: (name: string) => `${name} に戻る`,
    chipGroups: [
      {
        label: "着方",
        exclusive: false,
        chips: ["一枚で着る", "ジャケットの下に着る", "毎日着る", "暑い時期に着る"],
      },
      {
        label: "フィット",
        exclusive: true,
        chips: ["ジャストで着たい", "ゆったり着たい"],
      },
      {
        label: "普段のサイズ",
        exclusive: true,
        chips: ["普段はS", "普段はM", "普段はL"],
      },
      {
        label: "そのほか",
        exclusive: false,
        chips: ["透けが気になる", "はじめての一枚", "2枚目を買い足す"],
      },
    ] as ConciergeChipGroup[],
    intro:
      "身長か普段のサイズと、どう着たいかを教えてください。ゲージ・シルエット・サイズを一つご提案します。",
    viewing: (name: string) => `${name} をご覧いただいています。`,
    disclaimer: "自動応答です。サイズは目安としてご利用ください。",
    heightLabel: "身長",
    heightMessage: (cm: number) => `身長${cm}cm`,
    separator: "。",
    picked: (text: string) => `（${text}）`,
    messageLabel: "ご相談内容",
    placeholder: "例：体重65kg。白シャツの代わりに着たい。",
    submit: "相談する",
    pending: "確認しています",
    reset: "はじめから",
    empty: "身長、当てはまる項目、またはご相談内容のいずれかをご入力ください。",
    tooLong: `${CONCIERGE_LIMITS.maxMessageChars}文字以内でご入力ください。`,
    rateLimited: (seconds: number) =>
      `続けてのご相談が多くなっています。${seconds}秒ほどおいて、もう一度お試しください。`,
    unavailable:
      "ただいまお答えできません。時間をおいてお試しいただくか、お問い合わせください。",
    conversation: "コンシェルジュとの会話",
    customer: "お客様：",
    charCount: "文字数 ",
    contact: "お問い合わせ",
    card: {
      inStock: "在庫あり",
      low: (count: number) => `残り${count}点`,
      sizeUndecided: "サイズ未定",
      primary: "おすすめ",
      alternative: "もう一つの候補",
      primaryHeading: "おすすめの一枚",
      size: "サイズ",
      price: "価格",
      stock: "在庫",
      view: "商品を見る",
      viewInSize: (size: string) => `${size} で商品を見る`,
      addSize: (size: string) => `${size} をカートに入れる`,
      addedAnnouncement: (title: string) =>
        `${title} をカートに追加しました。`,
    },
  },
  {
    label: "Concierge",
    title: "Which gauge, in which size.",
    lead: "Three gauges, two silhouettes, three sizes. From your height and how you wear a tee, we point you to one of the 18.",
    metaTitle: "Size and gauge concierge",
    metaDescription:
      "Tell us your height and how you wear a tee. We suggest which gauge (28G, 36G or 46G), which silhouette and which size.",
    backTo: (name: string) => `Back to ${name}`,
    chipGroups: [
      {
        label: "How you wear it",
        exclusive: false,
        chips: ["On its own", "Under a jacket", "Every day", "In hot weather"],
      },
      {
        label: "Fit",
        exclusive: true,
        chips: ["True to size", "A relaxed fit"],
      },
      {
        label: "Usual size",
        exclusive: true,
        chips: ["Usual size S", "Usual size M", "Usual size L"],
      },
      {
        label: "Other",
        exclusive: false,
        chips: ["Worried about sheerness", "My first tee", "Adding a second one"],
      },
    ],
    intro:
      "Tell us your height or usual size, and how you want to wear it. We will suggest one gauge, one silhouette and one size.",
    viewing: (name: string) => `You are looking at ${name}. `,
    disclaimer: "This is an automated reply. Treat sizes as a guide.",
    heightLabel: "Height",
    heightMessage: (cm: number) => `Height ${cm} cm`,
    separator: ". ",
    picked: (text: string) => ` (${text})`,
    messageLabel: "Your question",
    placeholder: "e.g. 65 kg. I want to wear it in place of a white shirt.",
    submit: "Ask",
    pending: "Checking",
    reset: "Start again",
    empty: "Enter your height, choose any that apply, or write your question.",
    tooLong: `Please keep it within ${CONCIERGE_LIMITS.maxMessageChars} characters.`,
    rateLimited: (seconds: number) =>
      `Too many questions in a short time. Please wait about ${seconds} seconds and try again.`,
    unavailable:
      "We cannot answer just now. Please try again in a while, or contact us.",
    conversation: "Conversation with the concierge",
    customer: "You: ",
    charCount: "Characters ",
    contact: "Contact",
    card: {
      inStock: "In stock",
      low: (count: number) => `${count} left`,
      sizeUndecided: "Size not set",
      primary: "Recommended",
      alternative: "Another option",
      primaryHeading: "Our recommendation",
      size: "Size",
      price: "Price",
      stock: "Stock",
      view: "View the piece",
      viewInSize: (size: string) => `View in size ${size}`,
      addSize: (size: string) => `Add size ${size} to bag`,
      addedAnnouncement: (title: string) => `${title} added to your bag.`,
    },
  },
);

export type ConciergeUiCopy = ReturnType<typeof getConciergeCopy>;
