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
  };
}

export function mapProductRowToProduct(row: ProductWithPrimaryImage): Product {
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
    images: [],
    isPublished: row.is_published,
    fabricSlug: row.fabric_slug,
    fitProfile: parseFitProfileFromRow(row.slug, row.fit_profile),
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
    fitProfile: parseFitProfileFromRow(row.slug, row.fit_profile),
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
