import type {
  OrderItemRow,
  OrderRow,
} from "@/types/database";
import type {
  AdminOrderListItem,
  PaymentStatus,
} from "@/types/admin-order";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
} from "@/types/order";

import type { OrderStatus } from "@/types/database";

type PaymentStatusInput = {
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
};

export function derivePaymentStatus(order: PaymentStatusInput): PaymentStatus {
  if (
    (order.status === "paid" || order.status === "shipped") &&
    order.stripe_payment_intent_id
  ) {
    return "paid";
  }

  if (order.status === "failed") {
    return "failed";
  }

  if (order.status === "cancelled") {
    return "cancelled";
  }

  if (order.stripe_payment_intent_id) {
    return "pending";
  }

  return "unpaid";
}

export function mapOrderRowToAdminListItem(row: OrderRow): AdminOrderListItem {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    totalAmount: row.total_amount,
    status: row.status,
    paymentStatus: derivePaymentStatus(row),
  };
}

export function mapOrderItemRowToOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    variant: row.variant as OrderItem["variant"],
    quantity: row.quantity,
    unitPrice: row.unit_price,
  };
}

export function mapOrderRowsToOrder(
  order: OrderRow,
  items: OrderItemRow[],
): Order {
  return {
    id: order.id,
    email: order.email,
    status: order.status,
    totalAmount: order.total_amount,
    stripePaymentIntentId: order.stripe_payment_intent_id,
    items: items.map(mapOrderItemRowToOrderItem),
    createdAt: order.created_at,
  };
}

export function buildOrderInsertPayload(input: CreateOrderInput) {
  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return {
    user_id: input.userId ?? null,
    email: input.email ?? null,
    status: input.status ?? "pending",
    total_amount: totalAmount,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
  };
}

export function buildOrderItemInsertPayloads(
  orderId: string,
  input: CreateOrderInput,
) {
  return input.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    variant: item.variant,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));
}
