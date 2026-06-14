/**
 * Single source of truth for product catalog data.
 * Used by mock-products (fallback) and supabase/seed.sql (keep in sync).
 */
export type ProductCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  skuCode: string;
};

export const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "heavyweight-crew-neck",
    name: "Heavyweight Crew Neck",
    price: 8800,
    description: "厚手コットン100%。骨格のある白。",
    imageUrl: "/products/heavyweight-crew-neck-01.jpg",
    skuCode: "WT-001",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "lightweight-pocket-tee",
    name: "Lightweight Pocket Tee",
    price: 7200,
    description: "軽やかな着心地。左胸ポケット付き。",
    imageUrl: "/products/lightweight-pocket-tee-01.jpg",
    skuCode: "WT-002",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "relaxed-fit-tee",
    name: "Relaxed Fit Tee",
    price: 7900,
    description: "ゆとりのあるシルエット。ドロップショルダー。",
    imageUrl: "/products/relaxed-fit-tee-01.jpg",
    skuCode: "WT-003",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "compact-cotton-tee",
    name: "Compact Cotton Tee",
    price: 6500,
    description: "コンパクトな身幅。レイヤード向き。",
    imageUrl: "/products/compact-cotton-tee-01.jpg",
    skuCode: "WT-004",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "long-sleeve-essential",
    name: "Long Sleeve Essential",
    price: 9800,
    description: "長袖の定番。袖口はシンプルな仕上げ。",
    imageUrl: "/products/long-sleeve-essential-01.jpg",
    skuCode: "WT-005",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    slug: "box-fit-tee",
    name: "Box Fit Tee",
    price: 8400,
    description: "ボックスシルエット。存在感のある白。",
    imageUrl: "/products/box-fit-tee-01.jpg",
    skuCode: "WT-006",
  },
];

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
