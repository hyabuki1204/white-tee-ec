import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { getProductWearImageUrl } from "@/lib/products/wear-image";
import type { FabricCharacter, FabricCharacterLevel } from "@/lib/fabric/character";
import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

export const HOME_FEATURED_PRODUCT_SLUG = "heavyweight-crew-neck";

const THICKNESS_LABEL: Record<FabricCharacterLevel, string> = {
  1: "軽やか、開いた編み",
  2: "薄手、細番手",
  3: "中厚手",
  4: "しっかりしたボディ感",
  5: "ヘビーウェイト、密度高",
};

const SHEERNESS_LABEL: Record<FabricCharacterLevel, string> = {
  1: "低 — 日中も透けにくい",
  2: "低 — 透け感は少ない",
  3: "強い光下でやや見える",
  4: "日中で透けやすい",
  5: "日中でも透け感あり",
};

export type HomeDetailView = {
  src: string;
  alt: string;
};

export type HomeDetailContent = {
  productName: string;
  productHref: string;
  model: { height: string; size: string };
  material: string;
  specs: { label: string; value: string }[];
  views: HomeDetailView[];
};

function characterLabel(
  map: Record<FabricCharacterLevel, string>,
  level: FabricCharacterLevel,
): string {
  return map[level];
}

function findImageByPattern(images: Product["images"], pattern: RegExp): string | null {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.find((image) => pattern.test(image.url))?.url ?? null;
}

export function getHomeDetailViews(product: Product): HomeDetailView[] {
  const wearImage = getProductWearImageUrl(product);
  const side = wearImage ?? findImageByPattern(product.images, /-04\./i) ?? product.imageUrl;
  const full =
    findImageByPattern(product.images, /-05\./i) ??
    [...product.images]
      .sort((a, b) => b.sortOrder - a.sortOrder)
      .find((image) => image.url !== product.imageUrl && image.url !== side)?.url ??
    side;

  return [
    { src: product.imageUrl, alt: `${product.name} 正面` },
    { src: side, alt: `${product.name} サイド` },
    { src: full, alt: `${product.name} 全身` },
  ];
}

export function buildHomeDetailContent(
  product: Product,
  fabric: Fabric | null,
  fabricName?: string | null,
): HomeDetailContent {
  const character: FabricCharacter = fabric?.character ?? {
    thickness: 3,
    softness: 3,
    structure: 3,
    sheerness: 2,
    surface: 3,
  };
  const model = product.fitProfile.models[0];

  return {
    productName: getGraphpaperDisplayName(product, fabricName),
    productHref: `/products/${product.slug}`,
    model: {
      height: model ? `${model.heightCm}cm` : "175cm",
      size: model ? `${model.size}` : "L",
    },
    material: product.material || fabric?.tagline || "コットン100%ジャージー。",
    specs: [
      {
        label: "透け感",
        value: characterLabel(SHEERNESS_LABEL, character.sheerness),
      },
      {
        label: "厚み",
        value: characterLabel(THICKNESS_LABEL, character.thickness),
      },
      {
        label: "フィット",
        value: product.fitProfile.fitLabel,
      },
    ],
    views: getHomeDetailViews(product),
  };
}

export function findHomeFeaturedProduct(products: Product[]): Product | null {
  return (
    products.find((product) => product.slug === HOME_FEATURED_PRODUCT_SLUG) ??
    products[0] ??
    null
  );
}
