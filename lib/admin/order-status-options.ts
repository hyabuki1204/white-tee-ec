import type { OrderStatus } from "@/types/database";

/** Statuses available in the admin order update UI. */
export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "cancelled",
];

export function isAdminOrderStatus(value: string): value is OrderStatus {
  return ADMIN_ORDER_STATUSES.includes(value as OrderStatus);
}
