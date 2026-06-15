/** Size guide row stored in products.size_guide (jsonb). */
import type { ProductFitProfile } from "@/types/product-fit";

export type SizeGuideMeasurement = {
  size: ProductSize;
  length: number;
  shoulder: number;
  chest: number;
  sleeve: number;
};

export type ProductVariant = {
  id: string;
  size: ProductSize;
  sku: string | null;
  stockQuantity: number;
};

export type ProductImage = {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  /** Shown on product cards while pointer hover (desktop). */
  isCardHover?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  /** Short copy for product cards and metadata. */
  description: string;
  imageUrl: string;
  /** Long copy for PDP Description tab. */
  detailDescription: string;
  fitNote: string | null;
  material: string;
  care: string;
  sizeGuide: SizeGuideMeasurement[];
  variants: ProductVariant[];
  images: ProductImage[];
  isPublished: boolean;
  fabricSlug: string | null;
  fitProfile: ProductFitProfile;
};

export type {
  FitPreference,
  FitType,
  ProductFitProfile,
  ProductModelProfile,
  SizeReferenceBand,
  SizeRecommendationInput,
  SizeRecommendationResult,
} from "@/types/product-fit";

export type ProductSize = "S" | "M" | "L" | "XL";

export type { CreateOrderInput, CreateOrderItemInput, Order, OrderItem } from "@/types/order";
export type { ProductDetailContent } from "@/types/product-detail";
