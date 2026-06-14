import "server-only";

import { mapOrderToAdminDetail } from "@/lib/admin/map-order-detail";
import {
  getOrderById,
  listOrders,
  listOrdersPaginated,
} from "@/lib/db/orders/repository";
import type { AdminOrderDetail } from "@/types/admin-order";

export { listOrders, listOrdersPaginated };

/** Fetch a single order with line items for admin detail view. */
export async function getAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetail | null> {
  const order = await getOrderById(orderId);

  if (!order) {
    return null;
  }

  return await mapOrderToAdminDetail(order);
}
