import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";
import { PRICE_LADDER } from "@/lib/products/pricing";

export const CHECKOUT_TRUST_COPY = {
  title: "Before you check out",
  items: [
    {
      label: "Production",
      line: "Knit and finished in Wakayama — in-house, not outsourced.",
    },
    {
      label: "Shipping",
      line: RETURNS_POLICY.shipping,
    },
    {
      label: "Returns",
      line: RETURNS_POLICY.returns,
    },
    {
      label: "Payment",
      line: "Secure checkout via Stripe. Tax included.",
    },
    {
      label: "Price",
      line: `${PRICE_LADDER.label} collection. ${PRICE_LADDER.coreLabel}.`,
    },
  ],
  helperJa:
    "和歌山工場で製造。14日以内返品可。Stripeによる安全な決済。",
} as const;
