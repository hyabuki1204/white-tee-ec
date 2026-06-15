import type {
  Product,
  ProductDetailContent,
  ProductImage,
  ProductSize,
  ProductVariant,
  SizeGuideMeasurement,
} from "@/types";
import type {
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
  ProductWithPrimaryImage,
} from "@/types/database";
import { parseSizeGuide } from "@/lib/products/defaults";
import { parseFitProfileFromRow } from "@/lib/products/parse-fit-profile";
import {
  getDefaultSleeveType,
  isFitType,
  isSleeveType,
} from "@/lib/products/silhouette";
import type { FitType, SleeveType } from "@/types/product-fit";

function mapSilhouetteFields(
  row: Pick<ProductRow, "slug" | "fit_profile" | "sleeve_type" | "fit_type">,
): { sleeveType: SleeveType; fitType: FitType } {
  const fitProfile = parseFitProfileFromRow(row.slug, row.fit_profile);

  return {
    sleeveType: isSleeveType(row.sleeve_type)
      ? row.sleeve_type
      : getDefaultSleeveType(row.slug),
    fitType: isFitType(row.fit_type) ? row.fit_type : fitProfile.fitType,
  };
}

export function mapSizeGuideFromRow(value: unknown): SizeGuideMeasurement[] {
  return parseSizeGuide(value);
}

export function mapVariantRow(row: ProductVariantRow): ProductVariant {
  return {
    id: row.id,
    size: row.size as ProductSize,
    sku: row.sku,
    stockQuantity: row.stock_quantity,
  };
}

export function mapImageRow(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    url: row.url,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    isCardHover: row.is_card_hover ?? false,
  };
}

function mapListImages(
  images: Array<{
    id: string;
    url: string;
    sort_order: number;
    is_primary: boolean;
    is_card_hover?: boolean;
  }> | null | undefined,
): ProductImage[] {
  if (!images || images.length === 0) {
    return [];
  }

  return [...images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      url: image.url,
      sortOrder: image.sort_order,
      isPrimary: image.is_primary,
      isCardHover: image.is_card_hover ?? false,
    }));
}

export function mapProductRowToProduct(
  row: ProductWithPrimaryImage & {
    product_images?: Array<{
      id: string;
      url: string;
      sort_order: number;
      is_primary: boolean;
      is_card_hover?: boolean;
    }> | null;
  },
): Product {
  const silhouette = mapSilhouetteFields(row);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    description: row.description,
    imageUrl: row.primary_image_url ?? "",
    detailDescription: row.detail_description,
    fitNote: row.fit_note,
    material: row.material,
    care: row.care,
    sizeGuide: mapSizeGuideFromRow(row.size_guide),
    variants: [],
    images: mapListImages(row.product_images),
    isPublished: row.is_published,
    fabricSlug: row.fabric_slug,
    sleeveType: silhouette.sleeveType,
    fitType: silhouette.fitType,
    fitProfile: {
      ...parseFitProfileFromRow(row.slug, row.fit_profile),
      fitType: silhouette.fitType,
    },
  };
}

export function mapFullProductRow(
  row: ProductRow,
  variants: ProductVariantRow[],
  images: ProductImageRow[],
): Product {
  const mappedImages = images
    .map(mapImageRow)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage =
    mappedImages.find((image) => image.isPrimary) ?? mappedImages[0];
  const silhouette = mapSilhouetteFields(row);
  const fitProfile = parseFitProfileFromRow(row.slug, row.fit_profile);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    description: row.description,
    imageUrl: primaryImage?.url ?? "",
    detailDescription: row.detail_description,
    fitNote: row.fit_note,
    material: row.material,
    care: row.care,
    sizeGuide: mapSizeGuideFromRow(row.size_guide),
    variants: variants.map(mapVariantRow),
    images: mappedImages,
    isPublished: row.is_published,
    fabricSlug: row.fabric_slug,
    sleeveType: silhouette.sleeveType,
    fitType: silhouette.fitType,
    fitProfile: { ...fitProfile, fitType: silhouette.fitType },
  };
}

export function mapProductRowsToProducts(
  rows: ProductWithPrimaryImage[],
): Product[] {
  return rows.map(mapProductRowToProduct);
}

export function toProductDetailContent(product: Product): ProductDetailContent {
  return {
    description: product.detailDescription || product.description,
    fitNote: product.fitNote ?? undefined,
    material: product.material,
    care: product.care,
    sizeGuide: product.sizeGuide,
  };
}
