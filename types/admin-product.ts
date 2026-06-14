import type { ProductSize, SizeGuideMeasurement } from "@/types";

/** Admin list view of a product. */
export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  isPublished: boolean;
  primaryImageUrl: string | null;
  totalStock: number;
  updatedAt: string;
};

/** Full product payload for admin create/update forms. */
export type AdminProductInput = {
  slug: string;
  name: string;
  price: number;
  description: string;
  detailDescription: string;
  fitNote: string | null;
  material: string;
  care: string;
  sizeGuide: SizeGuideMeasurement[];
  isPublished: boolean;
  fabricSlug: string;
  variants: Array<{
    size: ProductSize;
    sku: string | null;
    stockQuantity: number;
    enabled: boolean;
  }>;
  images: Array<{
    id?: string;
    url: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
};

/** Admin detail view returned from repository. */
export type AdminProductDetail = AdminProductInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  hasOrders: boolean;
};

export type AdminProductDeleteResult =
  | { action: "deleted" }
  | { action: "archived"; reason: string };
