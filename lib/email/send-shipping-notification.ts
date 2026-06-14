import "server-only";

import { getSiteUrl } from "@/lib/seo/site";

import type { AdminOrderDetail } from "@/types/admin-order";

type SendResult = {
  sent: boolean;
  reason?: string;
};

function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildShippingEmailHtml(order: AdminOrderDetail): string {
  const items = order.items
    .map(
      (item) =>
        `<li>${item.productName} · Size ${item.variant} · Qty ${item.quantity}</li>`,
    )
    .join("");

  return `
    <p>Your order has shipped.</p>
    <p>Order ID: <strong>${order.id.slice(0, 8)}</strong></p>
    <p>Total: ${formatYen(order.totalAmount)}</p>
    <ul>${items}</ul>
    <p>Thank you for shopping with WHITE TEE.</p>
    <p><a href="${getSiteUrl()}/shipping">Shipping & Returns</a></p>
  `.trim();
}

export async function sendShippingNotification(
  order: AdminOrderDetail,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!order.email) {
    return { sent: false, reason: "missing_email" };
  }

  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject: "Your WHITE TEE order has shipped",
      html: buildShippingEmailHtml(order),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send shipping email: ${body}`);
  }

  return { sent: true };
}
