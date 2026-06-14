import type { PolicyPageContent } from "@/types/site-content";

export const DEFAULT_PRIVACY_SECTIONS: PolicyPageContent["sections"] = [
  {
    title: "個人情報の取り扱い",
    body: "WHITE TEE（以下「当店」）は、お客様の個人情報を適切に管理し、以下の方針に基づき取り扱います。",
  },
  {
    title: "収集する情報",
    body: "氏名、メールアドレス、配送先住所、決済情報（Stripe 経由）など、注文処理に必要な情報を収集します。",
  },
  {
    title: "利用目的",
    body: "商品の発送・決済処理、お問い合わせへの対応、サービス改善のための分析（個人を特定しない形式）に利用します。",
  },
  {
    title: "第三者提供",
    body: "決済処理（Stripe）、配送（配送業者）など、サービス提供に必要な範囲でのみ第三者と共有します。法令に基づく場合を除き、同意なく第三者に提供することはありません。",
  },
  {
    title: "お問い合わせ",
    body: "個人情報に関するご請求は、Contact ページよりご連絡ください。",
  },
];

export const DEFAULT_TERMS_SECTIONS: PolicyPageContent["sections"] = [
  {
    title: "第1条（適用）",
    body: "本規約は、WHITE TEE が提供するオンラインショップの利用条件を定めるものです。ご注文時点で本規約に同意したものとみなします。",
  },
  {
    title: "第2条（注文）",
    body: "ご注文は、当店による受注確認メールの送信をもって成立します。在庫切れ等によりご注文をお受けできない場合があります。",
  },
  {
    title: "第3条（価格・支払い）",
    body: "表示価格は税込です。お支払いは Stripe 経由のクレジットカード等で行います。決済完了後、発送手続きに進みます。",
  },
  {
    title: "第4条（返品・キャンセル）",
    body: "返品・交換条件は Shipping & Returns ページに記載のとおりです。発送前のキャンセルは Contact よりご連絡ください。",
  },
];

export const DEFAULT_PRIVACY_CONTENT: PolicyPageContent = {
  pageTitle: "Privacy Policy",
  sections: DEFAULT_PRIVACY_SECTIONS,
};

export const DEFAULT_TERMS_CONTENT: PolicyPageContent = {
  pageTitle: "Terms of Service",
  sections: DEFAULT_TERMS_SECTIONS,
};
