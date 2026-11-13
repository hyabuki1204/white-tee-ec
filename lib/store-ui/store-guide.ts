import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";

export type StoreGuideSection = {
  id: string;
  title: string;
  summary: string;
  href?: string;
  linkLabel?: string;
};

export const STORE_GUIDE_SECTIONS: StoreGuideSection[] = [
  {
    id: "order",
    title: "ご注文",
    summary:
      "ゲージ、シルエット、サイズを選んでカートに入れ、レジに進みます。サイズはS・M・Lの3種類。各商品ページに寸法表があります。",
    href: "/products",
    linkLabel: "コレクションを見る",
  },
  {
    id: "payment",
    title: "お支払い",
    summary:
      "クレジットカードでお支払いいただけます。決済はStripeで行います。表示価格はすべて税込です。",
  },
  {
    id: "shipping",
    title: "配送",
    summary: RETURNS_POLICY.shipping,
    href: "/shipping",
    linkLabel: "配送について",
  },
  {
    id: "tracking",
    title: "配送状況",
    summary: "商品発送後、追跡番号をメールでお知らせします。",
  },
  {
    id: "returns",
    title: "返品",
    summary: RETURNS_POLICY.storeGuideSummary,
    href: "/shipping",
    linkLabel: "返品について",
  },
  {
    id: "contact",
    title: "お問い合わせ",
    summary: "商品、ご注文、配送についてのご質問を承ります。",
    href: "/contact",
    linkLabel: "お問い合わせ",
  },
];

export const STORE_GUIDE_PAGE = {
  title: "ご利用ガイド",
  intro: "ご注文から、お支払い、配送、返品まで。お買い物の流れをまとめました。",
} as const;
