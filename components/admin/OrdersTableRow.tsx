"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  formatAdminListDate,
  formatPaymentStatusLabel,
} from "@/lib/admin/format";
import { adminTd, adminTdMuted } from "@/lib/admin/ui";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminOrderListItem } from "@/types/admin-order";

type OrdersTableRowProps = {
  order: AdminOrderListItem;
};

export function OrdersTableRow({ order }: OrdersTableRowProps) {
  const router = useRouter();
  const href = `/admin/orders/${order.id}`;
  const shortId = order.id.slice(0, 8);

  const navigate = () => {
    router.push(href);
  };

  return (
    <tr
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`注文 ${shortId}`}
      className="group cursor-pointer transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300"
    >
      <td className={adminTd}>
        <span className="font-mono font-medium text-neutral-900 underline decoration-transparent underline-offset-4 group-hover:decoration-neutral-400">
          {shortId}
        </span>
      </td>
      <td className={`${adminTdMuted} max-w-[14rem] truncate`}>
        {order.email ?? "—"}
      </td>
      <td className={`${adminTdMuted} tabular-nums`}>
        {formatAdminListDate(order.createdAt)}
      </td>
      <td className={`${adminTd} font-medium`}>{formatPrice(order.totalAmount)}</td>
      <td className={adminTd}>
        <StatusBadge status={order.status} />
      </td>
      <td className={adminTdMuted}>
        {formatPaymentStatusLabel(order.paymentStatus)}
      </td>
    </tr>
  );
}
