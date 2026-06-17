import "server-only";

import { getProductNamesByIds } from "@/lib/db/products/admin-repository";
import { derivePaymentStatus } from "@/lib/db/orders/mapper";
import { getDataSource } from "@/lib/supabase/env";
import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import type { AdminOrderDetail, AdminOrderDetailItem } from "@/types/admin-order";
import type { Order } from "@/types/order";

async function getProductNameMap(
  productIds: string[],
): Promise<Map<string, string>> {
  if (getDataSource() === "supabase") {
    return getProductNamesByIds(productIds);
  }

  return new Map(
    MOCK_PRODUCTS.filter((product) => productIds.includes(product.id)).map(
      (product) => [product.id, product.name],
    ),
  );
}

function mapOrderItemToAdminDetailItem(
  item: Order["items"][number],
  productNames: Map<string, string>,
): AdminOrderDetailItem {
  return {
    id: item.id,
    productName: productNames.get(item.productId) ?? "Unknown Product",
    variant: item.variant,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
  };
}

export async function mapOrderToAdminDetail(
  order: Order,
): Promise<AdminOrderDetail> {
  const productIds = [...new Set(order.items.map((item) => item.productId))];
  const productNames = await getProductNameMap(productIds);

  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: derivePaymentStatus({
      status: order.status,
      stripe_payment_intent_id: order.stripePaymentIntentId,
    }),
    totalAmount: order.totalAmount,
    email: order.email,
    stripePaymentIntentId: order.stripePaymentIntentId,
    shippingAddress: order.shippingAddress,
    orderNotes: order.orderNotes,
    items: order.items.map((item) =>
      mapOrderItemToAdminDetailItem(item, productNames),
    ),
  };
}
