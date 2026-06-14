/**
 * Supabase table row types.
 * Replace or extend with `supabase gen types` output when the project is connected.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "cancelled"
  | "failed";

export type FabricRow = {
  slug: string;
  name: string;
  tagline: string;
  description_lines: Json;
  image_url: string;
  image_alt: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type FabricInsert = {
  slug: string;
  name: string;
  tagline?: string;
  description_lines?: Json;
  image_url?: string;
  image_alt?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  detail_description: string;
  fit_note: string | null;
  material: string;
  care: string;
  size_guide: Json;
  is_published: boolean;
  price: number;
  fabric_slug: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductInsert = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  detail_description?: string;
  fit_note?: string | null;
  material?: string;
  care?: string;
  size_guide?: Json;
  is_published?: boolean;
  price: number;
  fabric_slug?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size: string;
  sku: string | null;
  stock_quantity: number;
  created_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  shipping_address: Json | null;
  created_at: string;
  updated_at: string;
};

export type OrderInsert = {
  id?: string;
  user_id?: string | null;
  email?: string | null;
  status?: OrderStatus;
  total_amount: number;
  stripe_payment_intent_id?: string | null;
  shipping_address?: Json | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type OrderItemInsert = {
  id?: string;
  order_id: string;
  product_id: string;
  variant: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
};

export type SiteContentRow = {
  key: string;
  content: Json;
  updated_at: string;
};

export type SiteContentInsert = {
  key: string;
  content: Json;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      site_content: {
        Row: SiteContentRow;
        Insert: SiteContentInsert;
        Update: Partial<SiteContentInsert>;
        Relationships: [];
      };
      fabrics: {
        Row: FabricRow;
        Insert: FabricInsert;
        Update: Partial<FabricInsert>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariantRow;
        Insert: Omit<ProductVariantRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<ProductVariantRow, "id" | "created_at">
        >;
        Relationships: [];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: Omit<ProductImageRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<ProductImageRow, "id" | "created_at">
        >;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_variant_stock: {
        Args: {
          p_product_id: string;
          p_size: string;
          p_quantity: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Product row joined with its primary image URL. */
export type ProductWithPrimaryImage = ProductRow & {
  primary_image_url: string | null;
};
