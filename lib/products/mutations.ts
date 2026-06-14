import "server-only";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductById,
  listAdminProducts,
  updateAdminProduct,
} from "@/lib/db/products/admin-repository";
import type {
  AdminProductDeleteResult,
  AdminProductDetail,
  AdminProductInput,
  AdminProductListItem,
} from "@/types/admin-product";

export async function listProductsForAdmin(): Promise<AdminProductListItem[]> {
  return listAdminProducts();
}

export async function getProductForAdmin(
  productId: string,
): Promise<AdminProductDetail | null> {
  return getAdminProductById(productId);
}

export async function createProduct(
  input: AdminProductInput,
): Promise<AdminProductDetail> {
  return createAdminProduct(input);
}

export async function updateProduct(
  productId: string,
  input: AdminProductInput,
): Promise<AdminProductDetail> {
  return updateAdminProduct(productId, input);
}

export async function deleteProduct(
  productId: string,
): Promise<AdminProductDeleteResult> {
  return deleteAdminProduct(productId);
}
