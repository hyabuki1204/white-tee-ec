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
    id: "shipping",
    title: "配送",
    summary:
      "ご注文確定後、3〜7営業日以内に発送します。送料は全国一律 ¥600（税込）。¥10,000以上で送料無料。",
    href: "/shipping",
    linkLabel: "配送について",
  },
  {
    id: "returns",
    title: "返品",
    summary: RETURNS_POLICY.storeGuideSummary,
    href: "/shipping",
    linkLabel: "返品について",
  },
  {
    id: "tracking",
    title: "配送状況",
    summary:
      "商品発送後、追跡番号をメールでお知らせします。",
    href: "/contact",
    linkLabel: "お問い合わせ",
  },
  {
    id: "tax",
    title: "税・関税",
    summary:
      "表示価格は税込です。国内配送に追加の関税はかかりません。",
  },
];

export const STORE_GUIDE_PAGE = {
  title: "ご利用ガイド",
  intro:
    "配送、返品、注文サポート——WHITE TEE でお買い物する際の基本情報です。",
} as const;
