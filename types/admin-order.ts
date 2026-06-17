import type { OrderStatus } from "@/types/database";
import type { ProductSize } from "@/types";
import type { ShippingAddress } from "@/types/order";

/** Admin list view of an order (no line items). */
export type AdminOrderListItem = {
  id: string;
  email: string | null;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
};

export type PaymentStatus =
  | "paid"
  | "pending"
  | "failed"
  | "cancelled"
  | "unpaid";

/** Admin detail view of a single order line item. */
export type AdminOrderDetailItem = {
  id: string;
  productName: string;
  variant: ProductSize;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

/** Admin detail view of an order with line items. */
export type AdminOrderDetail = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  email: string | null;
  stripePaymentIntentId: string | null;
  shippingAddress: ShippingAddress | null;
  orderNotes: string | null;
  items: AdminOrderDetailItem[];
};

export type PaginatedOrdersResult = {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
};
