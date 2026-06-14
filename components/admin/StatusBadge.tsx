import { formatOrderStatusLabel } from "@/lib/admin/format";
import { getOrderStatusStyle } from "@/lib/admin/order-status-styles";
import type { OrderStatus } from "@/types/database";

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { badge } = getOrderStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge} ${className}`.trim()}
    >
      {formatOrderStatusLabel(status)}
    </span>
  );
}
