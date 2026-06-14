import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  formatAdminDate,
  formatPaymentStatusLabel,
  formatShippingAddress,
  getStripePaymentUrl,
} from "@/lib/admin/format";
import { adminLink, adminSection, adminSectionTitle } from "@/lib/admin/ui";
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
  const labels = ADMIN_COPY.orderDetail;

  const rows: SummaryRow[] = [
    { label: labels.id, value: order.id },
    { label: labels.date, value: formatAdminDate(order.createdAt) },
    { label: labels.email, value: order.email ?? labels.emailNotRegistered },
    { label: labels.status, value: <StatusBadge status={order.status} /> },
    {
      label: labels.payment,
      value: formatPaymentStatusLabel(order.paymentStatus),
    },
    { label: labels.total, value: formatPrice(order.totalAmount) },
    {
      label: labels.shipping,
      value: (
        <span className="whitespace-pre-line">
          {formatShippingAddress(order.shippingAddress)}
        </span>
      ),
    },
  ];

  if (order.stripePaymentIntentId) {
    rows.push({
      label: labels.stripePayment,
      value: (
        <a
          href={getStripePaymentUrl(order.stripePaymentIntentId)}
          target="_blank"
          rel="noopener noreferrer"
          className={adminLink}
        >
          {order.stripePaymentIntentId}
        </a>
      ),
    });
  }

  return (
    <section className={`${adminSection} mb-6`}>
      <h2 className={adminSectionTitle}>{labels.summaryTitle}</h2>
      <dl className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr] sm:gap-6"
          >
            <dt className="text-sm font-medium text-neutral-600">{row.label}</dt>
            <dd className="text-sm text-neutral-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
