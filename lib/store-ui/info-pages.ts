/**
 * Copy for the shipping, contact and legal pages.
 *
 * In production the Japanese shipping sections, the contact intro and the
 * policy texts are edited in the admin (`site_content`). That table has no
 * English columns, so the English shown here is static. See
 * `lib/i18n/content-en.ts` for the same arrangement on products and journal.
 */
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  getReturnsPolicy,
  RETURNS_WINDOW_DAYS,
  SHIPS_WITHIN_JAPAN_ONLY,
} from "@/lib/store-ui/returns-policy";

const returnsEn = getReturnsPolicy("en");

export const getShippingPageCopy = defineCopy(
  {
    metaTitle: "配送・返品",
    metaDescription: "配送・返品について",
    title: "配送・返品",
    lead: "発送までの日数、送料、返品の条件です。",
    facts: [
      { value: "3–7", unit: "営業日", label: "ご注文確定から発送まで" },
      { value: "¥600", unit: "", label: "送料（全国一律・税込）" },
      { value: "¥10,000", unit: "以上", label: "送料無料になるご注文額" },
      {
        value: String(RETURNS_WINDOW_DAYS),
        unit: "日以内",
        label: "返品のご連絡期限（到着後）",
      },
    ],
    contactCta: "返品・交換のご連絡",
    guideCta: "ご利用ガイド",
  },
  {
    metaTitle: "Shipping & returns",
    metaDescription:
      "Dispatch times, shipping cost and returns. We currently ship within Japan only.",
    title: "Shipping & returns",
    lead: "Where we ship, how long dispatch takes, what it costs, and the conditions for returns.",
    facts: [
      { value: "3–7", unit: "business days", label: "From order to dispatch" },
      {
        value: "¥600",
        unit: "",
        label: "Shipping (flat rate within Japan, tax included)",
      },
      { value: "¥10,000", unit: "or more", label: "Order value for free shipping" },
      {
        value: String(RETURNS_WINDOW_DAYS),
        unit: "days",
        label: "To contact us about a return, from delivery",
      },
    ],
    contactCta: "Contact us about a return",
    guideCta: "Store guide",
  },
);

/** English shipping sections. The Japanese ones come from `site_content`. */
export const SHIPPING_SECTIONS_EN = [
  {
    title: "Where we ship",
    body: `${SHIPS_WITHIN_JAPAN_ONLY} Checkout accepts delivery addresses in Japan.`,
  },
  {
    title: "Carrier",
    body: "Delivered by Yamato Transport or Sagawa Express. We cannot take requests for a particular carrier.",
  },
  {
    title: "Shipping cost",
    body: "A flat ¥600 (tax included) anywhere in Japan. Free on orders of ¥10,000 (tax included) or more.",
  },
  {
    title: "Dispatch",
    body: "We dispatch within 3–7 business days of your order. It may take longer, depending on stock.",
  },
  {
    title: "Returns & exchanges",
    body: returnsEn.legalJa,
  },
] as const;

export const getOverseasInterestCopy = defineCopy(
  {
    // Shown on English pages only.
    label: "Outside Japan",
    title: "海外への発送について",
    body: "現在、発送は日本国内のみです。",
    success: "登録を受け付けました。",
  },
  {
    label: "Outside Japan",
    title: "Living outside Japan?",
    body: "We do not ship abroad at present. If you would like to hear should that change, leave your email address. It joins the WHITE TEE newsletter, which is where we would announce it.",
    success: "You are on the list. Thank you.",
  },
);

export const getContactPageCopy = defineCopy(
  {
    label: "Contact",
    title: "お問い合わせ",
    metaDescription: "WHITE TEE へのお問い合わせ",
    email: "メール",
    hours: "受付",
    orderTitle: "ご注文についてのお問い合わせ",
    orderBody: "確認メールに記載の注文番号を添えてご連絡ください。",
    beforeLabel: "Before you write",
    beforeTitle: "先にご確認ください",
    beforeLinks: [
      {
        href: "/store-guide",
        label: "ご利用ガイド",
        note: "ご注文からお届けまでの流れ",
      },
      {
        href: "/shipping",
        label: "配送・返品",
        note: "発送日数、送料、返品の条件",
      },
      { href: "/fabric", label: "ゲージ", note: "28G・36G・46Gの違い" },
    ],
  },
  {
    label: "Contact",
    title: "Contact",
    metaDescription: "Contact WHITE TEE.",
    email: "Email",
    hours: "Hours",
    orderTitle: "About an order",
    orderBody:
      "Please include the order number shown in your confirmation email.",
    beforeLabel: "Before you write",
    beforeTitle: "It may already be answered here",
    beforeLinks: [
      {
        href: "/store-guide",
        label: "Store guide",
        note: "From ordering to delivery",
      },
      {
        href: "/shipping",
        label: "Shipping & returns",
        note: "Dispatch times, cost, conditions for returns",
      },
      {
        href: "/fabric",
        label: "Gauge",
        note: "How 28G, 36G and 46G differ",
      },
    ],
  },
);

/** English lead for the contact page (the Japanese intro is in `site_content`). */
export const CONTACT_LEAD_EN =
  "For questions about products, orders or delivery, please write to the email address below.";

/* —— Legal pages: English summary, Japanese governs —— */

export const LEGAL_NOTICE_EN = {
  notice:
    "The Japanese text is the governing version. An English summary is provided for convenience.",
  summaryLabel: "English summary",
  summaryTitle: "What this page covers",
  originalLabel: "Japanese text",
  originalTitle: "Governing version (Japanese)",
} as const;

type SummaryRow = { title: string; body: string };

export const LEGAL_SUMMARY_EN: Record<
  "legal" | "privacy" | "terms",
  { label: string; title: string; lead: string; rows: SummaryRow[] }
> = {
  legal: {
    label: "Legal Notice",
    title: "Legal notice",
    lead: "The disclosures required of online sellers under Japan's Act on Specified Commercial Transactions.",
    rows: [
      {
        title: "Seller",
        body: "WHITE TEE. The operator's name, address and telephone number are given in the Japanese text below.",
      },
      {
        title: "Prices",
        body: "Each product page shows the price in Japanese yen, tax included. Orders are charged in yen. Amounts shown in other currencies are estimates only.",
      },
      {
        title: "Other charges",
        body: "Shipping: a flat ¥600 (tax included), free on orders of ¥10,000 or more.",
      },
      {
        title: "Payment",
        body: "By credit card, through Stripe, when the order is placed.",
      },
      {
        title: "Delivery",
        body: `${SHIPS_WITHIN_JAPAN_ONLY} Orders are dispatched within 3–7 business days of payment.`,
      },
      {
        title: "Returns",
        body: returnsEn.legalJa,
      },
    ],
  },
  privacy: {
    label: "Privacy Policy",
    title: "Privacy policy",
    lead: "How WHITE TEE handles customers' personal information.",
    rows: [
      {
        title: "Information collected",
        body: "What is needed to process an order: name, email address, delivery address, and payment details, which are handled by Stripe.",
      },
      {
        title: "Use",
        body: "Dispatching and charging for orders, answering enquiries, and analysis to improve the service in a form that does not identify individuals.",
      },
      {
        title: "Sharing",
        body: "Only as far as the service requires: Stripe for payment and the carrier for delivery. Otherwise not without consent, except where the law requires it.",
      },
      {
        title: "Requests",
        body: "Requests about your personal information can be made through the contact page.",
      },
    ],
  },
  terms: {
    label: "Terms of Service",
    title: "Terms of service",
    lead: "The conditions for using the WHITE TEE online store.",
    rows: [
      {
        title: "Scope",
        body: "These terms set the conditions for using the WHITE TEE online store. Placing an order is taken as agreement to them.",
      },
      {
        title: "Orders",
        body: "An order is concluded when the store sends its order confirmation email. An order may be declined, for example when an item is out of stock.",
      },
      {
        title: "Prices and payment",
        body: "Prices include tax and are charged in Japanese yen. Payment is by credit card through Stripe. Dispatch follows once payment is complete.",
      },
      {
        title: "Delivery",
        body: SHIPS_WITHIN_JAPAN_ONLY,
      },
      {
        title: "Returns and cancellation",
        body: `The conditions are those on the Shipping & returns page: unworn items with the tags attached, within ${RETURNS_WINDOW_DAYS} days of delivery. To cancel before dispatch, use the contact page.`,
      },
    ],
  },
};
