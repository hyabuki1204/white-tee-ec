import type { OrderStatus } from "@/types/database";

type StatusStyle = {
  badge: string;
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  pending: {
    badge: "bg-neutral-100 text-neutral-600",
  },
  paid: {
    badge: "bg-blue-50 text-blue-700",
  },
  shipped: {
    badge: "bg-green-50 text-green-700",
  },
  cancelled: {
    badge: "bg-red-50 text-red-700",
  },
  failed: {
    badge: "bg-neutral-100 text-neutral-500",
  },
};

export function getOrderStatusStyle(status: OrderStatus): StatusStyle {
  return ORDER_STATUS_STYLES[status];
}
