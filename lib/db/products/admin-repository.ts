import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapFullProductRow, mapImageRow, mapVariantRow } from "@/lib/db/products/mapper";
import { parseFitProfileFromRow } from "@/lib/products/parse-fit-profile";
import type {
  AdminProductDeleteResult,
  AdminProductDetail,
  AdminProductInput,
  AdminProductListItem,
} from "@/types/admin-product";
import type {
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
} from "@/types/database";

type ProductQueryRow = ProductRow & {
  product_images: ProductImageRow[] | null;
  product_variants: Pick<ProductVariantRow, "stock_quantity">[] | null;
};

function mapListItem(row: ProductQueryRow): AdminProductListItem {
  const images = row.product_images ?? [];
  const primary =
    images.find((image) => image.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0];

  const totalStock = (row.product_variants ?? []).reduce(
    (sum, variant) => sum + variant.stock_quantity,
    0,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    isPublished: row.is_published,
    primaryImageUrl: primary?.url ?? null,
    totalStock,
    updatedAt: row.updated_at,
  };
}

function mapAdminDetail(
  row: ProductRow,
  variants: ProductVariantRow[],
  images: ProductImageRow[],
  hasOrders: boolean,
): AdminProductDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    description: row.description,
    detailDescription: row.detail_description,
    fitNote: row.fit_note,
    material: row.material,
    care: row.care,
    sizeGuide: mapFullProductRow(row, variants, images).sizeGuide,
    isPublished: row.is_published,
    fabricSlug: row.fabric_slug ?? "",
    variants: variants.map((variant) => ({
      size: variant.size as AdminProductDetail["variants"][number]["size"],
      sku: variant.sku,
      stockQuantity: variant.stock_quantity,
      enabled: true,
    })),
    images: images
      .map(mapImageRow)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        url: image.url,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        isCardHover: image.isCardHover ?? false,
      })),
    fitProfile: parseFitProfileFromRow(row.slug, row.fit_profile),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hasOrders,
  };
}

async function productHasOrders(productId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();

  const { count, error } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) {
    throw new Error(`Failed to check order history: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

async function syncVariants(
  productId: string,
  variants: AdminProductInput["variants"],
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const enabledVariants = variants.filter((variant) => variant.enabled);

  const { data: existing, error: fetchError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);

  if (fetchError) {
    throw new Error(`Failed to fetch variants: ${fetchError.message}`);
  }

  const existingRows = existing ?? [];
  const enabledSizes = new Set(enabledVariants.map((variant) => variant.size));

  for (const row of existingRows) {
    if (!enabledSizes.has(row.size as AdminProductInput["variants"][number]["size"])) {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", row.id);

      if (error) {
        throw new Error(`Failed to remove variant ${row.size}: ${error.message}`);
      }
    }
  }

  for (const variant of enabledVariants) {
    const existingVariant = existingRows.find((row) => row.size === variant.size);

    if (existingVariant) {
      const { error } = await supabase
        .from("product_variants")
        .update({
          sku: variant.sku,
          stock_quantity: variant.stockQuantity,
        })
        .eq("id", existingVariant.id);

      if (error) {
        throw new Error(`Failed to update variant ${variant.size}: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from("product_variants").insert({
        product_id: productId,
        size: variant.size,
        sku: variant.sku,
        stock_quantity: variant.stockQuantity,
      });

      if (error) {
        throw new Error(`Failed to create variant ${variant.size}: ${error.message}`);
      }
    }
  }
}

async function syncImages(
  productId: string,
  images: AdminProductInput["images"],
): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId);

  if (fetchError) {
    throw new Error(`Failed to fetch images: ${fetchError.message}`);
  }

  const existingRows = existing ?? [];
  const incomingIds = new Set(
    images.map((image) => image.id).filter((id): id is string => Boolean(id)),
  );

  for (const row of existingRows) {
    if (!incomingIds.has(row.id)) {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", row.id);

      if (error) {
        throw new Error(`Failed to remove image: ${error.message}`);
      }
    }
  }

  for (const [index, image] of images.entries()) {
    if (image.id) {
      const { error } = await supabase
        .from("product_images")
        .update({
          url: image.url,
          sort_order: index,
          is_primary: image.isPrimary,
          is_card_hover: image.isCardHover === true,
        })
        .eq("id", image.id);

      if (error) {
        throw new Error(`Failed to update image: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        url: image.url,
        sort_order: index,
        is_primary: image.isPrimary,
        is_card_hover: image.isCardHover === true,
      });

      if (error) {
        throw new Error(`Failed to create image: ${error.message}`);
      }
    }
  }
}

function buildProductPayload(input: AdminProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    price: input.price,
    description: input.description,
    detail_description: input.detailDescription,
    fit_note: input.fitNote,
    material: input.material,
    care: input.care,
    size_guide: input.sizeGuide,
    is_published: input.isPublished,
    fabric_slug: input.fabricSlug,
    fit_profile: input.fitProfile,
  };
}

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images(id, url, sort_order, is_primary),
      product_variants(stock_quantity)
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list products: ${error.message}`);
  }

  return (data ?? []).map((row) => mapListItem(row as unknown as ProductQueryRow));
}

export async function getAdminProductById(
  productId: string,
): Promise<AdminProductDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new Error(`Failed to fetch product: ${productError.message}`);
  }

  if (!product) {
    return null;
  }

  const [{ data: variants, error: variantsError }, { data: images, error: imagesError }, hasOrders] =
    await Promise.all([
      supabase.from("product_variants").select("*").eq("product_id", productId),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true }),
      productHasOrders(productId),
    ]);

  if (variantsError) {
    throw new Error(`Failed to fetch variants: ${variantsError.message}`);
  }

  if (imagesError) {
    throw new Error(`Failed to fetch images: ${imagesError.message}`);
  }

  const detail = mapAdminDetail(
    product,
    variants ?? [],
    images ?? [],
    hasOrders,
  );

  const enabledSizes = new Set((variants ?? []).map((variant) => variant.size));

  detail.variants = inputVariantsWithDisabledSizes(
    detail.variants,
    enabledSizes,
  );

  return detail;
}

function inputVariantsWithDisabledSizes(
  existingVariants: AdminProductDetail["variants"],
  enabledSizes: Set<string>,
): AdminProductDetail["variants"] {
  const existingBySize = new Map(
    existingVariants.map((variant) => [variant.size, variant]),
  );

  return ["S", "M", "L", "XL"].map((size) => {
    const existing = existingBySize.get(size as AdminProductDetail["variants"][number]["size"]);

    if (existing) {
      return {
        ...existing,
        enabled: enabledSizes.has(size),
      };
    }

    return {
      size: size as AdminProductDetail["variants"][number]["size"],
      sku: null,
      stockQuantity: 0,
      enabled: false,
    };
  });
}

export async function createAdminProduct(
  input: AdminProductInput,
): Promise<AdminProductDetail> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot create product: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(buildProductPayload(input))
    .select("*")
    .single();

  if (productError || !product) {
    if (productError?.message.includes("products_slug_key")) {
      throw new Error("A product with this slug already exists.");
    }

    throw new Error(
      `Failed to create product: ${productError?.message ?? "Unknown error"}`,
    );
  }

  await syncVariants(product.id, input.variants);
  await syncImages(product.id, input.images);

  const detail = await getAdminProductById(product.id);

  if (!detail) {
    throw new Error("Failed to load created product.");
  }

  return detail;
}

export async function updateAdminProduct(
  productId: string,
  input: AdminProductInput,
): Promise<AdminProductDetail> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot update product: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .update(buildProductPayload(input))
    .eq("id", productId)
    .select("*")
    .single();

  if (productError || !product) {
    if (productError?.message.includes("products_slug_key")) {
      throw new Error("A product with this slug already exists.");
    }

    throw new Error(
      `Failed to update product: ${productError?.message ?? "Unknown error"}`,
    );
  }

  await syncVariants(product.id, input.variants);
  await syncImages(product.id, input.images);

  const detail = await getAdminProductById(product.id);

  if (!detail) {
    throw new Error("Failed to load updated product.");
  }

  return detail;
}

export async function deleteAdminProduct(
  productId: string,
): Promise<AdminProductDeleteResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot delete product: Supabase is not configured.");
  }

  const hasOrders = await productHasOrders(productId);

  if (hasOrders) {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("products")
      .update({ is_published: false })
      .eq("id", productId);

    if (error) {
      throw new Error(`Failed to archive product: ${error.message}`);
    }

    return {
      action: "archived",
      reason:
        "This product has order history and was unpublished instead of deleted.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  return { action: "deleted" };
}

export async function getProductNamesByIds(
  productIds: string[],
): Promise<Map<string, string>> {
  if (!isSupabaseConfigured() || productIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);

  if (error) {
    throw new Error(`Failed to fetch product names: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.id, row.name]));
}

export async function getCheckoutProductsByIds(
  productIds: string[],
): Promise<
  Map<
    string,
    {
      id: string;
      name: string;
      price: number;
      variants: ProductVariantRow[];
    }
  >
> {
  if (!isSupabaseConfigured() || productIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabaseAdminClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, is_published")
    .in("id", productIds);

  if (productsError) {
    throw new Error(`Failed to fetch checkout products: ${productsError.message}`);
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds);

  if (variantsError) {
    throw new Error(`Failed to fetch checkout variants: ${variantsError.message}`);
  }

  const variantsByProduct = new Map<string, ProductVariantRow[]>();

  for (const variant of variants ?? []) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  return new Map(
    (products ?? [])
      .filter((product) => product.is_published)
      .map((product) => [
        product.id,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          variants: variantsByProduct.get(product.id) ?? [],
        },
      ]),
  );
}
