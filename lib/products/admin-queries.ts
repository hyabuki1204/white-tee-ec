import "server-only";

export {
  getAdminProductById as getProductForAdmin,
  listAdminProducts as listProductsForAdmin,
} from "@/lib/db/products/admin-repository";
