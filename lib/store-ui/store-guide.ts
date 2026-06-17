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
    title: "Shipping",
    summary:
      "Orders ship within 3–7 business days. Domestic shipping is ¥600; free on orders over ¥10,000.",
    href: "/shipping",
    linkLabel: "Shipping details",
  },
  {
    id: "returns",
    title: "Returns",
    summary:
      "Unworn items may be returned within 7 days of delivery. Contact us to begin a return.",
    href: "/shipping",
    linkLabel: "Return policy",
  },
  {
    id: "tracking",
    title: "Order tracking",
    summary:
      "A tracking number is sent by email once your order leaves our atelier.",
    href: "/contact",
    linkLabel: "Contact",
  },
  {
    id: "tax",
    title: "Tax & duties",
    summary:
      "Prices include tax. No additional duties apply to domestic orders within Japan.",
  },
];

export const STORE_GUIDE_PAGE = {
  title: "Store Guide",
  intro:
    "Shipping, returns, and order support — the essentials for shopping with WHITE TEE.",
} as const;
