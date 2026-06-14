import "server-only";

import { createSupabaseStaticClient } from "@/lib/supabase/static";
import {
  mapFullProductRow,
  mapProductRowToProduct,
  mapProductRowsToProducts,
} from "@/lib/db/products/mapper";
import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import { getDataSource } from "@/lib/supabase/env";
import type { Product } from "@/types";
import type {
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
  ProductWithPrimaryImage,
} from "@/types/database";

type ProductQueryRow = ProductRow & {
  product_images: Array<{
    url: string;
    is_primary: boolean;
    sort_order: number;
  }> | null;
};

type ProductDetailQueryRow = ProductRow & {
  product_images: ProductImageRow[] | null;
  product_variants: ProductVariantRow[] | null;
};

function pickPrimaryImageUrl(
  images: ProductQueryRow["product_images"],
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  const primary = images.find((image) => image.is_primary);
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return primary?.url ?? sorted[0]?.url ?? null;
}

function mapQueryRowToProductWithImage(
  row: ProductQueryRow,
): ProductWithPrimaryImage {
  return {
    ...row,
    primary_image_url: pickPrimaryImageUrl(row.product_images),
  };
}

async function getProductsFromSupabase(): Promise<Product[]> {
  const supabase = createSupabaseStaticClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images(url, is_primary, sort_order)
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  const rows = (data ?? []).map((row) =>
    mapQueryRowToProductWithImage(row as unknown as ProductQueryRow),
  );
  return mapProductRowsToProducts(rows);
}

async function getProductBySlugFromSupabase(
  slug: string,
): Promise<Product | null> {
  const supabase = createSupabaseStaticClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images(*),
      product_variants(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as ProductDetailQueryRow;

  return mapFullProductRow(
    row,
    row.product_variants ?? [],
    row.product_images ?? [],
  );
}

async function getProductsByIdsFromSupabase(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = createSupabaseStaticClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images(url, is_primary, sort_order)
    `,
    )
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to fetch products by id: ${error.message}`);
  }

  const rows = (data ?? []).map((row) =>
    mapQueryRowToProductWithImage(row as unknown as ProductQueryRow),
  );
  return mapProductRowsToProducts(rows);
}

function getProductsFromMock(): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.isPublished);
}

function getProductBySlugFromMock(slug: string): Product | null {
  return (
    MOCK_PRODUCTS.find(
      (product) => product.slug === slug && product.isPublished,
    ) ?? null
  );
}

function getProductsByIdsFromMock(ids: string[]): Product[] {
  const idSet = new Set(ids);
  return MOCK_PRODUCTS.filter((product) => idSet.has(product.id));
}

/** Fetch all products from the configured data source. */
export async function getProducts(): Promise<Product[]> {
  if (getDataSource() === "supabase") {
    return getProductsFromSupabase();
  }

  return getProductsFromMock();
}

/** Fetch a single product by slug from the configured data source. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (getDataSource() === "supabase") {
    return getProductBySlugFromSupabase(slug);
  }

  return getProductBySlugFromMock(slug);
}

/** Fetch products by id (cart / checkout helpers). */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (getDataSource() === "supabase") {
    return getProductsByIdsFromSupabase(ids);
  }

  return getProductsByIdsFromMock(ids);
}

/** Fetch all product slugs (for static params / sitemap). */
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await getProducts();
  return products.map((product) => product.slug);
}

/** Lightweight lookup map for client cart hydration. */
export async function getProductLookupMap(
  ids: string[],
): Promise<Record<string, Pick<Product, "id" | "name" | "price" | "imageUrl">>> {
  const products = await getProductsByIds(ids);

  return Object.fromEntries(
    products.map((product) => [
      product.id,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
    ]),
  );
}

/** Fetch a single product by id. */
export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProductsByIds([id]);
  return products[0] ?? null;
}

/** Legacy mapper export for list rows. */
export { mapProductRowToProduct } from "@/lib/db/products/mapper";
