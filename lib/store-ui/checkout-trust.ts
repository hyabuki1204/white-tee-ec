import { defineCopy } from "@/lib/i18n/define-copy";
import { PRICE_LADDER } from "@/lib/products/pricing";
import {
  getReturnsPolicy,
  SHIPS_WITHIN_JAPAN_ONLY,
} from "@/lib/store-ui/returns-policy";

const returnsJa = getReturnsPolicy("ja");
const returnsEn = getReturnsPolicy("en");

export const getCheckoutTrustCopy = defineCopy(
  {
    title: "ご注文前のご確認",
    shippingLink: returnsJa.shippingLink,
    items: [
      {
        id: "production",
        label: "製造",
        line: "生地は和歌山市の工場で編んでいます。",
      },
      {
        id: "shipping",
        label: "配送",
        line: returnsJa.shipping,
      },
      {
        id: "returns",
        label: "返品",
        line: returnsJa.returns,
      },
      {
        id: "payment",
        label: "決済",
        line: "Stripeによる安全な決済。表示価格は税込です。",
      },
      {
        id: "price",
        label: "価格",
        line: `価格帯は ${PRICE_LADDER.label}。各商品ページに個別の税込価格を表示します。`,
      },
    ],
  },
  {
    title: "Before you order",
    shippingLink: returnsEn.shippingLink,
    items: [
      {
        id: "production",
        label: "Made",
        line: "The cloth is knitted at a mill in Wakayama City.",
      },
      {
        id: "shipping",
        label: "Shipping",
        line: `${SHIPS_WITHIN_JAPAN_ONLY} ${returnsEn.shipping}`,
      },
      {
        id: "returns",
        label: "Returns",
        line: returnsEn.returns,
      },
      {
        id: "payment",
        label: "Payment",
        line: "Secure card payment through Stripe, charged in Japanese yen. Prices include tax.",
      },
      {
        id: "price",
        label: "Price",
        line: `Prices range ${PRICE_LADDER.label}. Each product page shows its own tax-inclusive price.`,
      },
    ],
  },
);
