import { parseAdminFitProfile } from "@/lib/admin/product-fit-input";
import type {
  AdminProductDetail,
  AdminProductInput,
} from "@/types/admin-product";
import type { ProductSize } from "@/types";
import {
  DEFAULT_CARE,
  DEFAULT_MATERIAL,
  PRODUCT_SIZES,
  createDefaultSizeGuide,
  isValidProductSlug,
  parseSizeGuide,
} from "@/lib/products/defaults";
import { getDefaultFitProfile } from "@/lib/products/fit-profiles";

type ValidationResult =
  | { ok: true; data: AdminProductInput }
  | { ok: false; error: string };

function readString(value: unknown, field: string): string | null {
  if (typeof value !== "string") {
    return `${field} is required.`;
  }

  return null;
}

function readOptionalString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  return value.trim();
}

export function parseAdminProductInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const input = body as Record<string, unknown>;

  const slugError = readString(input.slug, "Slug");
  if (slugError) return { ok: false, error: slugError };

  const nameError = readString(input.name, "Name");
  if (nameError) return { ok: false, error: nameError };

  const slug = (input.slug as string).trim().toLowerCase();
  const name = (input.name as string).trim();

  if (!isValidProductSlug(slug)) {
    return {
      ok: false,
      error: "Slug must use lowercase letters, numbers, and hyphens only.",
    };
  }

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const price = Number(input.price);

  if (!Number.isInteger(price) || price < 0) {
    return { ok: false, error: "Price must be a non-negative integer (JPY)." };
  }

  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const detailDescription =
    typeof input.detailDescription === "string"
      ? input.detailDescription.trim()
      : "";
  const material =
    typeof input.material === "string" && input.material.trim()
      ? input.material.trim()
      : DEFAULT_MATERIAL;
  const care =
    typeof input.care === "string" && input.care.trim()
      ? input.care.trim()
      : DEFAULT_CARE;
  const fitNote = readOptionalString(input.fitNote);
  const isPublished = input.isPublished !== false;
  const sizeGuide = parseSizeGuide(input.sizeGuide);

  const fabricSlugError = readString(input.fabricSlug, "Fabric");
  if (fabricSlugError) return { ok: false, error: fabricSlugError };

  const fabricSlug = (input.fabricSlug as string).trim();

  if (!fabricSlug) {
    return { ok: false, error: "Fabric is required." };
  }

  const variants = parseVariants(input.variants);
  if ("error" in variants) {
    return { ok: false, error: variants.error };
  }

  const images = parseImages(input.images);
  if ("error" in images) {
    return { ok: false, error: images.error };
  }

  const fitProfile = parseAdminFitProfile(input.fitProfile);
  if (typeof fitProfile === "string") {
    return { ok: false, error: fitProfile };
  }

  return {
    ok: true,
    data: {
      slug,
      name,
      price,
      description,
      detailDescription,
      fitNote,
      material,
      care,
      sizeGuide,
      isPublished,
      fabricSlug,
      variants: variants.data,
      images: images.data,
      fitProfile,
    },
  };
}

function parseVariants(
  value: unknown,
):
  | {
      data: AdminProductInput["variants"];
    }
  | { error: string } {
  if (!Array.isArray(value)) {
    return { error: "Variants must be an array." };
  }

  const enabledVariants = value.filter(
    (variant) =>
      typeof variant === "object" &&
      variant !== null &&
      (variant as { enabled?: boolean }).enabled !== false,
  );

  if (enabledVariants.length === 0) {
    return { error: "At least one size must be enabled." };
  }

  const parsed: AdminProductInput["variants"] = [];
  const seenSizes = new Set<ProductSize>();

  for (const variant of value) {
    if (typeof variant !== "object" || variant === null) {
      continue;
    }

    const row = variant as Record<string, unknown>;
    const size = row.size;

    if (typeof size !== "string" || !PRODUCT_SIZES.includes(size as ProductSize)) {
      continue;
    }

    const stockQuantity = Number(row.stockQuantity);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return { error: `Invalid stock quantity for size ${size}.` };
    }

    const enabled = row.enabled !== false;
    const sku =
      typeof row.sku === "string" && row.sku.trim() ? row.sku.trim() : null;

    parsed.push({
      size: size as ProductSize,
      sku,
      stockQuantity,
      enabled,
    });
    seenSizes.add(size as ProductSize);
  }

  const enabledCount = parsed.filter((variant) => variant.enabled).length;

  if (enabledCount === 0) {
    return { error: "At least one size must be enabled." };
  }

  for (const enabledVariant of parsed.filter((variant) => variant.enabled)) {
    if (!seenSizes.has(enabledVariant.size)) {
      return { error: "Invalid variant configuration." };
    }
  }

  return { data: parsed };
}

function parseImages(
  value: unknown,
):
  | {
      data: AdminProductInput["images"];
    }
  | { error: string } {
  if (!Array.isArray(value)) {
    return { error: "Images must be an array." };
  }

  const parsed: AdminProductInput["images"] = value
    .map((image, index) => {
      if (typeof image !== "object" || image === null) {
        return null;
      }

      const row = image as Record<string, unknown>;
      const url = typeof row.url === "string" ? row.url.trim() : "";

      if (!url) {
        return null;
      }

      return {
        id: typeof row.id === "string" ? row.id : undefined,
        url,
        sortOrder:
          typeof row.sortOrder === "number" ? row.sortOrder : index,
        isPrimary: row.isPrimary === true,
      };
    })
    .filter((image): image is NonNullable<typeof image> => image !== null);

  if (parsed.length === 0) {
    return { error: "At least one product image is required." };
  }

  const primaryCount = parsed.filter((image) => image.isPrimary).length;

  if (primaryCount !== 1) {
    parsed[0]!.isPrimary = true;

    for (let index = 1; index < parsed.length; index += 1) {
      parsed[index]!.isPrimary = false;
    }
  }

  return { data: parsed.sort((a, b) => a.sortOrder - b.sortOrder) };
}

export function toAdminProductFormDefaults(): AdminProductDetail {
  const now = new Date().toISOString();

  return {
    id: "",
    slug: "",
    name: "",
    price: 0,
    description: "",
    detailDescription: "",
    fitNote: null,
    material: DEFAULT_MATERIAL,
    care: DEFAULT_CARE,
    sizeGuide: createDefaultSizeGuide(),
    isPublished: true,
    fabricSlug: "heavyweight-jersey",
    variants: PRODUCT_SIZES.map((size) => ({
      size,
      sku: null,
      stockQuantity: 0,
      enabled: true,
    })),
    images: [],
    fitProfile: getDefaultFitProfile(""),
    createdAt: now,
    updatedAt: now,
    hasOrders: false,
  };
}
