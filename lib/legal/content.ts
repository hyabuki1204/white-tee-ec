/** Legal and policy copy for storefront pages. */
import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";

export const LEGAL_BUSINESS = {
  name: "WHITE TEE",
  operator: "WHITE TEE（運営責任者：金政 浩平）",
  address: "〒150-0000 東京都渋谷区（※本番公開前に実住所へ更新してください）",
  email: "hello@white-tee.example.com",
  phone: "03-0000-0000（平日 10:00–17:00）",
} as const;

export const CONTACT_INTRO = [
  "商品・注文・配送に関するお問い合わせは、",
  "下記メールアドレスよりご連絡ください。",
] as const;

export const SHIPPING_SECTIONS = [
  {
    title: "配送方法",
    body: "ヤマト運輸または佐川急便にてお届けします。配送業者の指定は承っておりません。",
  },
  {
    title: "送料",
    body: "全国一律 ¥600（税込）。¥10,000（税込）以上のご注文で送料無料。",
  },
  {
    title: "お届け目安",
    body: "ご注文確定後、3〜7営業日以内に発送いたします。在庫状況により遅れる場合があります。",
  },
  {
    title: "返品・交換",
    body: RETURNS_POLICY.legalJa,
  },
] as const;
