import "server-only";

import {
  getVariantAvailability,
  insertRestockRequest,
} from "@/lib/db/restock/repository";
import { normalizeEmail } from "@/lib/newsletter/subscribe";
import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import type { RestockErrorCode } from "@/lib/restock/copy";
import { getDataSource } from "@/lib/supabase/env";
import type { ProductSize } from "@/types";
import type { RestockLocale } from "@/types/database";

const SIZES: readonly ProductSize[] = ["S", "M", "L", "XL"];
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RestockRequestResult =
  | { ok: true }
  | { ok: false; reason: Exclude<RestockErrorCode, "rate_limited"> };

function parseSize(value: unknown): ProductSize | null {
  if (typeof value !== "string") return null;

  const size = value.trim().toUpperCase() as ProductSize;
  return SIZES.includes(size) ? size : null;
}

function parseLocale(value: unknown): RestockLocale {
  return value === "en" ? "en" : "ja";
}

/**
 * Register "tell me once when this size is back".
 *
 * Only accepted for a size that exists on a published product and has no
 * stock right now. A repeat request is a silent success: the response never
 * says whether the address was already registered.
 */
export async function createRestockRequest(input: {
  email?: unknown;
  productId?: unknown;
  size?: unknown;
  locale?: unknown;
}): Promise<RestockRequestResult> {
  const productId =
    typeof input.productId === "string" ? input.productId.trim() : "";
  const size = parseSize(input.size);

  if (!UUID_PATTERN.test(productId) || !size) {
    return { ok: false, reason: "invalid_request" };
  }

  const email = normalizeEmail(input.email);
  if (!email) return { ok: false, reason: "invalid_email" };

  if (getDataSource() === "mock") {
    const variant = MOCK_PRODUCTS.find(
      (product) => product.id === productId && product.isPublished,
    )?.variants.find((entry) => entry.size === size);

    if (!variant) return { ok: false, reason: "not_found" };
    if (variant.stockQuantity > 0) return { ok: false, reason: "in_stock" };

    // Mock catalog = local development: accept without storing so the flow
    // can be exercised. A production build must never promise an email it
    // has nowhere to record. (The newsletter endpoint answers 503 here.)
    return process.env.NODE_ENV === "production"
      ? { ok: false, reason: "unavailable" }
      : { ok: true };
  }

  try {
    const availability = await getVariantAvailability(productId, size);

    if (!availability.found) return { ok: false, reason: "not_found" };
    if (availability.stockQuantity > 0) return { ok: false, reason: "in_stock" };

    await insertRestockRequest({
      email,
      productId,
      size,
      locale: parseLocale(input.locale),
    });

    return { ok: true };
  } catch (error) {
    console.error(
      "restock: request failed",
      error instanceof Error ? error.message : error,
    );
    return { ok: false, reason: "unavailable" };
  }
}
