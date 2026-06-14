"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatAdminLabel, formatAdminListDate } from "@/lib/admin/format";
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
      aria-label={`Order ${shortId}`}
      className="group cursor-pointer border-b border-neutral-200/40 transition-colors last:border-b-0 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-neutral-300"
    >
      <td className="py-6 pr-6">
        <span className="font-mono text-xs font-light text-neutral-900 underline decoration-transparent underline-offset-4 transition-[text-decoration-color] group-hover:decoration-neutral-400">
          {shortId}
        </span>
      </td>
      <td className="max-w-[12rem] truncate py-6 pr-6 text-xs font-light text-neutral-600">
        {order.email ?? "—"}
      </td>
      <td className="py-6 pr-6 text-xs font-light tabular-nums text-neutral-600">
        {formatAdminListDate(order.createdAt)}
      </td>
      <td className="py-6 pr-6 text-xs font-light text-neutral-800">
        {formatPrice(order.totalAmount)}
      </td>
      <td className="py-6 pr-6">
        <StatusBadge status={order.status} />
      </td>
      <td className="py-6 text-xs font-light text-neutral-600">
        {formatAdminLabel(order.paymentStatus)}
      </td>
    </tr>
  );
}
