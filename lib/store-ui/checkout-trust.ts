import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";
import { PRICE_LADDER } from "@/lib/products/pricing";

export const CHECKOUT_TRUST_COPY = {
  title: "ご注文前のご確認",
  shippingLink: RETURNS_POLICY.shippingLink,
  items: [
    {
      id: "production",
      label: "製造",
      line: "和歌山の自社工場で編み立て・仕上げ。外注ではなく一貫製造です。",
    },
    {
      id: "shipping",
      label: "配送",
      line: RETURNS_POLICY.shipping,
    },
    {
      id: "returns",
      label: "返品",
      line: RETURNS_POLICY.returns,
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
} as const;
