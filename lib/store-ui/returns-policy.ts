import { defineCopy } from "@/lib/i18n/define-copy";

/** Days after delivery within which an unworn, tagged item can be returned. */
export const RETURNS_WINDOW_DAYS = 14;

/** The one sentence that states where the store ships. English pages only. */
export const SHIPS_WITHIN_JAPAN_ONLY = "We currently ship within Japan only.";

/** Shared returns and fulfillment reassurance copy. */
export const getReturnsPolicy = defineCopy(
  {
    windowDays: RETURNS_WINDOW_DAYS,
    shipping:
      "ご注文確定後、3〜7営業日以内に発送します。送料は全国一律 ¥600（税込）。¥10,000以上で送料無料。",
    returns:
      "タグ付き未使用品は到着後14日以内に返品可能です。自宅で試着後、お問い合わせよりご依頼ください。",
    shippingNote:
      "3〜7営業日以内に発送。タグ付き未使用品は14日以内返品可。",
    helperJa:
      "3〜7営業日で発送。¥10,000以上で送料無料。タグ付き未使用品は14日以内返品可。",
    storeGuideSummary:
      "タグ付き未使用品は到着後14日以内に返品を承ります。お問い合わせよりご連絡ください。",
    legalJa:
      "タグ付き・未使用の商品に限り、到着後14日以内にご連絡いただければ返品を承ります。サイズ確認のための試着は可能です。お客様都合の返品送料はお客様負担となります。",
    shippingLink: "配送・返品について",
  },
  {
    windowDays: RETURNS_WINDOW_DAYS,
    shipping:
      "We dispatch within 3–7 business days of your order. Shipping is a flat ¥600 (tax included) anywhere in Japan, and free on orders of ¥10,000 or more.",
    returns:
      "Unworn items with the tags attached can be returned within 14 days of delivery. Try it on at home, then contact us to arrange the return.",
    shippingNote:
      "Dispatched within 3–7 business days. Unworn items with tags can be returned within 14 days.",
    helperJa:
      "Dispatched in 3–7 business days. Free shipping from ¥10,000. Unworn items with tags can be returned within 14 days.",
    storeGuideSummary:
      "We accept returns of unworn items with the tags attached within 14 days of delivery. Please get in touch through the contact page.",
    legalJa:
      "We accept returns of unworn items with the tags attached if you contact us within 14 days of delivery. Trying an item on to check the size is fine. For a change of mind, return postage is paid by the customer.",
    shippingLink: "Shipping & returns",
  },
);
