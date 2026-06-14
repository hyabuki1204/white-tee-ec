import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatAdminDate, formatAdminLabel } from "@/lib/admin/format";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminOrderDetail } from "@/types/admin-order";
import type { ReactNode } from "react";

type OrderDetailSummaryProps = {
  order: AdminOrderDetail;
};

type SummaryRow = {
  label: string;
  value: ReactNode;
};

export function OrderDetailSummary({ order }: OrderDetailSummaryProps) {
  const rows: SummaryRow[] = [
    { label: "Order ID", value: order.id },
    { label: "Date", value: formatAdminDate(order.createdAt) },
    { label: "Status", value: <StatusBadge status={order.status} /> },
    {
      label: "Payment",
      value: formatAdminLabel(order.paymentStatus),
    },
    { label: "Total", value: formatPrice(order.totalAmount) },
  ];

  if (order.email) {
    rows.splice(2, 0, { label: "Email", value: order.email });
  }

  return (
    <dl className="space-y-5 border-b border-neutral-200/70 pb-12">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr] sm:gap-8"
        >
          <dt className="text-xs font-light tracking-wide text-neutral-500">
            {row.label}
          </dt>
          <dd className="text-xs font-light text-neutral-800">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
