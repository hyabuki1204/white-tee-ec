import type { OrderStatus } from "@/types/database";
import type { ProductSize } from "@/types";

/** Shipping address collected at Stripe Checkout. */
export type ShippingAddress = {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

/** Domain model for an order shown in the app or returned from mutations. */
export type Order = {
  id: string;
  email: string | null;
  status: OrderStatus;
  totalAmount: number;
  stripePaymentIntentId: string | null;
  shippingAddress: ShippingAddress | null;
  orderNotes: string | null;
  items: OrderItem[];
  createdAt: string;
};

/** Domain model for a single order line item. */
export type OrderItem = {
  id: string;
  productId: string;
  variant: ProductSize;
  quantity: number;
  unitPrice: number;
};

/** Input for creating an order (e.g. from checkout or Stripe webhook). */
export type CreateOrderInput = {
  email?: string | null;
  userId?: string | null;
  status?: OrderStatus;
  stripePaymentIntentId?: string | null;
  shippingAddress?: ShippingAddress | null;
  orderNotes?: string | null;
  items: CreateOrderItemInput[];
};

export type CreateOrderItemInput = {
  productId: string;
  variant: ProductSize;
  quantity: number;
  unitPrice: number;
};

/** Insert payload mapped to Supabase `orders` table. */
export type OrderInsertPayload = {
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  shipping_address: ShippingAddress | null;
  order_notes: string | null;
};

/** Insert payload mapped to Supabase `order_items` table. */
export type OrderItemInsertPayload = {
  order_id: string;
  product_id: string;
  variant: string;
  quantity: number;
  unit_price: number;
};
