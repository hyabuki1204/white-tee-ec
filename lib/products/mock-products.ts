import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import { PRODUCT_FABRIC_SLUG_BY_PRODUCT_SLUG } from "@/lib/fabric/content";
import {
  DEFAULT_CARE,
  DEFAULT_MATERIAL,
  PRODUCT_SIZES,
  createDefaultSizeGuide,
} from "@/lib/products/defaults";
import type { Product, ProductVariant } from "@/types";

const DETAIL_BY_SLUG: Record<
  string,
  {
    detailDescription: string;
    fitNote: string | null;
    sizeGuide: Product["sizeGuide"];
  }
> = {
  "heavyweight-crew-neck": {
    detailDescription:
      "厚手のコットン100%ジャージー。しっかりとした密度で、白の輪郭がはっきりと立つ一枚です。",
    fitNote: "Regular fit",
    sizeGuide: createDefaultSizeGuide(),
  },
  "lightweight-pocket-tee": {
    detailDescription:
      "軽量なコットン100%。肌に沿うような柔らかさと、通気性のよい風合い。左胸のポケット付き。",
    fitNote: "Regular fit",
    sizeGuide: createDefaultSizeGuide(),
  },
  "relaxed-fit-tee": {
    detailDescription:
      "ゆとりのあるシルエットとドロップショルダー。肩のラインを落とし、体のラインを強調しない着心地。",
    fitNote: "Relaxed fit",
    sizeGuide: createDefaultSizeGuide(),
  },
  "compact-cotton-tee": {
    detailDescription:
      "コンパクトな身幅と短めの着丈。インナーとして重ねやすく、ジャケットの下にも余計なボリュームを出しません。",
    fitNote: "Slim fit",
    sizeGuide: createDefaultSizeGuide(),
  },
  "long-sleeve-essential": {
    detailDescription:
      "長袖の定番Tシャツ。袖口はシンプルな仕上げで、季節を問わず白の質感を楽しめる一着です。",
    fitNote: "Regular fit",
    sizeGuide: createDefaultSizeGuide(),
  },
  "box-fit-tee": {
    detailDescription:
      "ボックスシルエット。直線的なラインが、白の存在感を静かに引き立てます。",
    fitNote: "Box fit",
    sizeGuide: createDefaultSizeGuide(),
  },
};

function buildVariants(skuCode: string): ProductVariant[] {
  return PRODUCT_SIZES.map((size, index) => ({
    id: `${skuCode}-${size}`,
    size,
    sku: `${skuCode}-${size}`,
    stockQuantity: 10 - index,
  }));
}

function buildImages(productId: string, slug: string): Product["images"] {
  return [1, 2, 3].map((index) => ({
    id: `${productId}-image-${index - 1}`,
    url: `/products/${slug}-0${index}.jpg`,
    sortOrder: index - 1,
    isPrimary: index === 1,
  }));
}

/** Mock product list — mirrors Supabase seed data (same ids / slugs). */
export const MOCK_PRODUCTS: Product[] = PRODUCT_CATALOG.map(
  ({ id, slug, name, price, description, imageUrl, skuCode }) => {
    const detail = DETAIL_BY_SLUG[slug];

    return {
      id,
      slug,
      name,
      price,
      description,
      imageUrl,
      detailDescription: detail?.detailDescription ?? description,
      fitNote: detail?.fitNote ?? null,
      material: DEFAULT_MATERIAL,
      care: DEFAULT_CARE,
      sizeGuide: detail?.sizeGuide ?? createDefaultSizeGuide(),
      variants: buildVariants(skuCode),
      images: buildImages(id, slug),
      isPublished: true,
      fabricSlug: PRODUCT_FABRIC_SLUG_BY_PRODUCT_SLUG[slug] ?? null,
    };
  },
);
