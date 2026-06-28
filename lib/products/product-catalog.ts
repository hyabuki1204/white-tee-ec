/**
 * Single source of truth for product catalog data.
 * Used by mock-products (fallback) and supabase/seed.sql (keep in sync).
 */
import { PRODUCT_PRICE_BY_SLUG } from "@/lib/products/pricing";

export type ProductCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  skuCode: string;
  fabricSlug: string;
  sleeveType: "short" | "long";
  fitType: "slim" | "regular" | "relaxed" | "boxy";
};

export const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "heavyweight-crew-neck",
    name: "Heavyweight Crew Neck",
    price: PRODUCT_PRICE_BY_SLUG["heavyweight-crew-neck"]!,
    description: "厚手コットン100%。骨格のある白。",
    imageUrl: "/products/heavyweight-crew-neck-01.jpg",
    skuCode: "WT-001",
    fabricSlug: "heavyweight-jersey",
    sleeveType: "short",
    fitType: "regular",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "lightweight-pocket-tee",
    name: "Lightweight Pocket Tee",
    price: PRODUCT_PRICE_BY_SLUG["lightweight-pocket-tee"]!,
    description: "軽やかな着心地。左胸ポケット付き。",
    imageUrl: "/products/lightweight-pocket-tee-01.jpg",
    skuCode: "WT-002",
    fabricSlug: "lightweight-jersey",
    sleeveType: "short",
    fitType: "regular",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "relaxed-fit-tee",
    name: "Relaxed Fit Tee",
    price: PRODUCT_PRICE_BY_SLUG["relaxed-fit-tee"]!,
    description: "ゆとりのあるシルエット。ドロップショルダー。",
    imageUrl: "/products/relaxed-fit-tee-01.jpg",
    skuCode: "WT-003",
    fabricSlug: "relaxed-jersey",
    sleeveType: "short",
    fitType: "relaxed",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "compact-cotton-tee",
    name: "Compact Cotton Tee",
    price: PRODUCT_PRICE_BY_SLUG["compact-cotton-tee"]!,
    description: "コンパクトな身幅。レイヤード向き。",
    imageUrl: "/products/compact-cotton-tee-01.jpg",
    skuCode: "WT-004",
    fabricSlug: "compact-jersey",
    sleeveType: "short",
    fitType: "slim",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "long-sleeve-essential",
    name: "Long Sleeve Essential",
    price: PRODUCT_PRICE_BY_SLUG["long-sleeve-essential"]!,
    description: "長袖の定番。袖口はシンプルな仕上げ。",
    imageUrl: "/products/long-sleeve-essential-01.jpg",
    skuCode: "WT-005",
    fabricSlug: "essential-jersey",
    sleeveType: "long",
    fitType: "regular",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    slug: "box-fit-tee",
    name: "Box Fit Tee",
    price: PRODUCT_PRICE_BY_SLUG["box-fit-tee"]!,
    description: "ボックスシルエット。存在感のある白。",
    imageUrl: "/products/box-fit-tee-01.jpg",
    skuCode: "WT-006",
    fabricSlug: "box-jersey",
    sleeveType: "short",
    fitType: "boxy",
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    slug: "short-sleeve-essential",
    name: "Short Sleeve Essential",
    price: PRODUCT_PRICE_BY_SLUG["short-sleeve-essential"]!,
    description: "Essential Jerseyの半袖定番。一年中着られる一枚。",
    imageUrl: "/products/short-sleeve-essential-01.jpg",
    skuCode: "WT-007",
    fabricSlug: "essential-jersey",
    sleeveType: "short",
    fitType: "regular",
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    slug: "heavyweight-crew-neck-long-sleeve",
    name: "Heavyweight Crew Neck Long Sleeve",
    price: PRODUCT_PRICE_BY_SLUG["heavyweight-crew-neck-long-sleeve"]!,
    description: "Heavyweight Jerseyの長袖版。密度のある白。",
    imageUrl: "/products/heavyweight-crew-neck-long-sleeve-01.jpg",
    skuCode: "WT-008",
    fabricSlug: "heavyweight-jersey",
    sleeveType: "long",
    fitType: "regular",
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    slug: "lightweight-pocket-tee-long-sleeve",
    name: "Lightweight Pocket Tee Long Sleeve",
    price: PRODUCT_PRICE_BY_SLUG["lightweight-pocket-tee-long-sleeve"]!,
    description: "軽やかな長袖ポケットT。通気性のよい風合い。",
    imageUrl: "/products/lightweight-pocket-tee-long-sleeve-01.jpg",
    skuCode: "WT-009",
    fabricSlug: "lightweight-jersey",
    sleeveType: "long",
    fitType: "regular",
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    slug: "relaxed-fit-tee-long-sleeve",
    name: "Relaxed Fit Tee Long Sleeve",
    price: PRODUCT_PRICE_BY_SLUG["relaxed-fit-tee-long-sleeve"]!,
    description: "Relaxed Jerseyの長袖版。ゆとりのあるドレープ。",
    imageUrl: "/products/relaxed-fit-tee-long-sleeve-01.jpg",
    skuCode: "WT-010",
    fabricSlug: "relaxed-jersey",
    sleeveType: "long",
    fitType: "relaxed",
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    slug: "compact-cotton-tee-long-sleeve",
    name: "Compact Cotton Tee Long Sleeve",
    price: PRODUCT_PRICE_BY_SLUG["compact-cotton-tee-long-sleeve"]!,
    description: "Compact Jerseyの長袖版。スリムなレイヤード向き。",
    imageUrl: "/products/compact-cotton-tee-long-sleeve-01.jpg",
    skuCode: "WT-011",
    fabricSlug: "compact-jersey",
    sleeveType: "long",
    fitType: "slim",
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    slug: "box-fit-tee-long-sleeve",
    name: "Box Fit Tee Long Sleeve",
    price: PRODUCT_PRICE_BY_SLUG["box-fit-tee-long-sleeve"]!,
    description: "Box Jerseyの長袖版。直線的なボックスシルエット。",
    imageUrl: "/products/box-fit-tee-long-sleeve-01.jpg",
    skuCode: "WT-012",
    fabricSlug: "box-jersey",
    sleeveType: "long",
    fitType: "boxy",
  },
];

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;

export const PRODUCT_CATALOG_BY_SLUG = Object.fromEntries(
  PRODUCT_CATALOG.map((entry) => [entry.slug, entry]),
) as Record<string, ProductCatalogEntry>;
