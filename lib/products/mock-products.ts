import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import { PRODUCT_FABRIC_SLUG_BY_PRODUCT_SLUG } from "@/lib/fabric/content";
import {
  DEFAULT_CARE,
  DEFAULT_MATERIAL,
  PRODUCT_SIZES,
} from "@/lib/products/defaults";
import { getDefaultFitProfile } from "@/lib/products/fit-profiles";
import { getProductDetailSeed } from "@/lib/products/product-details";
import { getDefaultSleeveType } from "@/lib/products/silhouette";
import type { Product, ProductVariant } from "@/types";

function buildVariants(skuCode: string): ProductVariant[] {
  return PRODUCT_SIZES.map((size) => ({
    id: `${skuCode}-${size}`,
    size,
    sku: `${skuCode}-${size}`,
    stockQuantity: 10,
  }));
}

/** 01 front · 02 back · 03 on-model (card hover) · 04 collar detail. */
function buildImages(productId: string, slug: string): Product["images"] {
  const entries = [1, 2, 3, 4];

  return entries.map((index) => ({
    id: `${productId}-image-${index - 1}`,
    url: `/products/${slug}-0${index}.jpg`,
    sortOrder: index - 1,
    isPrimary: index === 1,
    isCardHover: index === 3,
  }));
}

/** Mock product list — mirrors Supabase seed data (same ids / slugs). */
export const MOCK_PRODUCTS: Product[] = PRODUCT_CATALOG.map(
  ({
    id,
    slug,
    name,
    price,
    description,
    imageUrl,
    skuCode,
    fabricSlug,
    fitType,
  }) => {
    const detail = getProductDetailSeed(slug);
    const fitProfile = getDefaultFitProfile(slug);

    return {
      id,
      slug,
      name,
      price,
      description,
      imageUrl,
      detailDescription: detail.detailDescription || description,
      fitNote: detail.fitNote,
      material: DEFAULT_MATERIAL,
      care: DEFAULT_CARE,
      sizeGuide: detail.sizeGuide,
      variants: buildVariants(skuCode),
      images: buildImages(id, slug),
      isPublished: true,
      fabricSlug:
        fabricSlug ?? PRODUCT_FABRIC_SLUG_BY_PRODUCT_SLUG[slug] ?? null,
      sleeveType: getDefaultSleeveType(slug),
      fitType,
      fitProfile,
    };
  },
);
