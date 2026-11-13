/**
 * Single source of truth for product catalog data.
 * 3 gauges × 2 silhouettes = 6 products, each in S / M / L (18 SKUs).
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

const GAUGES = [
  {
    gauge: 28,
    fabricSlug: "28g-jersey",
    regular: "双糸で編んだ肉厚の度詰天竺。一枚で着る、ハリのある白。",
    box: "肉厚の28Gを、広い身幅と短い着丈で。形が立つ白。",
  },
  {
    gauge: 36,
    fabricSlug: "36g-jersey",
    regular: "滑らかで偏りのない36G。毎日着るための基準の白。",
    box: "36Gの落ち着いた表面を、ゆとりのある箱形で。",
  },
  {
    gauge: 46,
    fabricSlug: "46g-jersey",
    regular: "1インチに針46本。薄く、密で、ジャケットの下に収まる白。",
    box: "最も細かい46Gを、広い身幅で。布帛のように落ちる白。",
  },
] as const;

export const PRODUCT_CATALOG: ProductCatalogEntry[] = GAUGES.flatMap(
  ({ gauge, fabricSlug, regular, box }, index) => {
    const base = index * 2;

    return [
      {
        id: `20000000-0000-4000-8000-00000000000${base + 1}`,
        slug: `${gauge}g-regular-tee`,
        name: `${gauge}G Regular Tee`,
        price: PRODUCT_PRICE_BY_SLUG[`${gauge}g-regular-tee`]!,
        description: regular,
        imageUrl: `/products/${gauge}g-regular-tee-01.jpg`,
        skuCode: `WT-${gauge}R`,
        fabricSlug,
        sleeveType: "short" as const,
        fitType: "regular" as const,
      },
      {
        id: `20000000-0000-4000-8000-00000000000${base + 2}`,
        slug: `${gauge}g-box-tee`,
        name: `${gauge}G Box Tee`,
        price: PRODUCT_PRICE_BY_SLUG[`${gauge}g-box-tee`]!,
        description: box,
        imageUrl: `/products/${gauge}g-box-tee-01.jpg`,
        skuCode: `WT-${gauge}B`,
        fabricSlug,
        sleeveType: "short" as const,
        fitType: "boxy" as const,
      },
    ];
  },
);

export const PRODUCT_SIZES = ["S", "M", "L"] as const;

export const PRODUCT_CATALOG_BY_SLUG = Object.fromEntries(
  PRODUCT_CATALOG.map((entry) => [entry.slug, entry]),
) as Record<string, ProductCatalogEntry>;
