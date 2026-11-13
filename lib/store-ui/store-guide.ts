import { defineCopy } from "@/lib/i18n/define-copy";
import {
  getReturnsPolicy,
  SHIPS_WITHIN_JAPAN_ONLY,
} from "@/lib/store-ui/returns-policy";

export type StoreGuideSection = {
  id: string;
  title: string;
  summary: string;
  href?: string;
  linkLabel?: string;
};

const returnsJa = getReturnsPolicy("ja");
const returnsEn = getReturnsPolicy("en");

export const getStoreGuide = defineCopy(
  {
    label: "Guide",
    title: "ご利用ガイド",
    intro:
      "ご注文から、お支払い、配送、返品まで。お買い物の流れをまとめました。",
    shippingDetail: "配送・返品の詳細",
    contact: "お問い合わせ",
    sections: [
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
        summary: returnsJa.shipping,
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
        summary: returnsJa.storeGuideSummary,
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
    ] as StoreGuideSection[],
  },
  {
    label: "Guide",
    title: "Store guide",
    intro:
      "Ordering, payment, delivery and returns: how shopping here works, in one place.",
    shippingDetail: "Shipping & returns in detail",
    contact: "Contact",
    sections: [
      {
        id: "order",
        title: "Ordering",
        summary:
          "Choose a gauge, a silhouette and a size, add it to your bag and go to checkout. There are three sizes: S, M and L. Each product page has a table of measurements.",
        href: "/products",
        linkLabel: "View the collection",
      },
      {
        id: "payment",
        title: "Payment",
        summary:
          "You can pay by credit card. Payment is handled by Stripe. All prices include tax, and orders are charged in Japanese yen.",
      },
      {
        id: "shipping",
        title: "Shipping",
        summary: `${SHIPS_WITHIN_JAPAN_ONLY} ${returnsEn.shipping}`,
        href: "/shipping",
        linkLabel: "About shipping",
      },
      {
        id: "tracking",
        title: "Tracking",
        summary: "Once your order ships, we email you the tracking number.",
      },
      {
        id: "returns",
        title: "Returns",
        summary: returnsEn.storeGuideSummary,
        href: "/shipping",
        linkLabel: "About returns",
      },
      {
        id: "contact",
        title: "Contact",
        summary: "We answer questions about products, orders and delivery.",
        href: "/contact",
        linkLabel: "Contact",
      },
    ],
  },
);
