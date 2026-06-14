import "server-only";

import {
  getFabricBySlugFromDb,
  listFabricOptions,
  listFabrics,
} from "@/lib/db/fabrics/repository";
import type { Fabric } from "@/lib/fabric/content";
import { getProducts } from "@/lib/products/queries";
import type { Product } from "@/types";

export { listFabricOptions };

export async function getFabrics(): Promise<Fabric[]> {
  return listFabrics();
}

export async function getFabricSlugs(): Promise<string[]> {
  const fabrics = await getFabrics();
  return fabrics.map((fabric) => fabric.slug);
}

export async function getFabricBySlug(slug: string): Promise<Fabric | null> {
  return getFabricBySlugFromDb(slug);
}

export async function getFabricForProduct(
  product: Pick<Product, "fabricSlug">,
): Promise<Fabric | null> {
  if (!product.fabricSlug) {
    return null;
  }

  return getFabricBySlug(product.fabricSlug);
}

export async function getProductsForFabric(
  fabricSlug: string,
): Promise<Product[]> {
  const products = await getProducts();

  return products.filter((product) => product.fabricSlug === fabricSlug);
}

export async function getRelatedProductsForFabric(
  fabricSlug: string,
  excludeProductSlug: string,
  limit = 4,
): Promise<Product[]> {
  const products = await getProductsForFabric(fabricSlug);

  return products
    .filter((product) => product.slug !== excludeProductSlug)
    .slice(0, limit);
}
