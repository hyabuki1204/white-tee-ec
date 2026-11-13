import "server-only";

import {
  getStorefrontFabricBySlug,
  listFabricOptions,
  listStorefrontFabrics,
} from "@/lib/db/fabrics/repository";
import type { Fabric } from "@/lib/fabric/content";
import type { Locale } from "@/lib/i18n/config";
import {
  localizeFabric,
  localizeFabrics,
  localizeProducts,
} from "@/lib/i18n/content-en";
import { getProducts } from "@/lib/products/queries";
import type { Product } from "@/types";

export { listFabricOptions };

/** Storefront fabrics — only those with at least one published product. */
export async function getFabrics(locale: Locale): Promise<Fabric[]> {
  return localizeFabrics(await listStorefrontFabrics(), locale);
}

export async function getFabricSlugs(): Promise<string[]> {
  const fabrics = await listStorefrontFabrics();
  return fabrics.map((fabric) => fabric.slug);
}

/** Storefront lookup — null for unknown or retired fabrics. */
export async function getFabricBySlug(
  slug: string,
  locale: Locale,
): Promise<Fabric | null> {
  const fabric = await getStorefrontFabricBySlug(slug);
  return fabric ? localizeFabric(fabric, locale) : null;
}

export async function getFabricForProduct(
  product: Pick<Product, "fabricSlug">,
  locale: Locale,
): Promise<Fabric | null> {
  if (!product.fabricSlug) {
    return null;
  }

  return getFabricBySlug(product.fabricSlug, locale);
}

export async function getProductsForFabric(
  fabricSlug: string,
  locale: Locale,
): Promise<Product[]> {
  const products = localizeProducts(await getProducts(), locale);

  return products.filter((product) => product.fabricSlug === fabricSlug);
}

export async function getRelatedProductsForFabric(
  fabricSlug: string,
  excludeProductSlug: string,
  locale: Locale,
  limit = 4,
): Promise<Product[]> {
  const products = await getProductsForFabric(fabricSlug, locale);

  return products
    .filter((product) => product.slug !== excludeProductSlug)
    .slice(0, limit);
}
