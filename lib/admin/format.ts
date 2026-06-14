import { ADMIN_COPY } from "@/lib/admin/copy";
import type { OrderStatus } from "@/types/database";
import type { ShippingAddress } from "@/types/order";

export function formatAdminDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Date-only format for admin list views (e.g. 2026/06/13). */
export function formatAdminListDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: ADMIN_COPY.status.pending,
  paid: ADMIN_COPY.status.paid,
  shipped: ADMIN_COPY.status.shipped,
  cancelled: ADMIN_COPY.status.cancelled,
  failed: ADMIN_COPY.status.failed,
};

export function formatOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatPaymentStatusLabel(status: string): string {
  const key = status as keyof typeof ADMIN_COPY.payment;
  return ADMIN_COPY.payment[key] ?? status;
}

export function formatShippingAddress(
  address: ShippingAddress | null | undefined,
): string {
  if (!address) {
    return ADMIN_COPY.orderDetail.shippingNotRegistered;
  }

  const lines: string[] = [];

  if (address.name) {
    lines.push(address.name);
  }

  const street = [address.postalCode, address.state, address.city, address.line1]
    .filter(Boolean)
    .join(" ");

  if (street) {
    lines.push(street);
  }

  if (address.line2) {
    lines.push(address.line2);
  }

  if (address.country) {
    lines.push(address.country);
  }

  return lines.length > 0
    ? lines.join("\n")
    : ADMIN_COPY.orderDetail.shippingNotRegistered;
}

export function getStripePaymentUrl(paymentIntentId: string): string {
  return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
}

/** @deprecated Use formatOrderStatusLabel */
export function formatAdminLabel(value: string): string {
  const key = value as OrderStatus;
  if (key in ORDER_STATUS_LABELS) {
    return formatOrderStatusLabel(key);
  }
  return value;
}
