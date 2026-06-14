"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin/order-status-options";
import { formatAdminLabel } from "@/lib/admin/format";
import type { OrderStatus } from "@/types/database";

type OrderStatusUpdaterProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const selectableStatuses = ADMIN_ORDER_STATUSES.includes(currentStatus)
    ? ADMIN_ORDER_STATUSES
    : [currentStatus, ...ADMIN_ORDER_STATUSES];

  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as {
        error?: string;
        email?: { sent: boolean; reason?: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update status.");
      }

      if (status === "shipped") {
        if (data.email?.sent) {
          setMessage("Status updated. Shipping email sent.");
        } else if (data.email?.reason === "not_configured") {
          setMessage("Status updated. Email not configured (set RESEND_API_KEY).");
        } else if (data.email?.reason === "missing_email") {
          setMessage("Status updated. No customer email on this order.");
        } else {
          setMessage("Status updated.");
        }
      } else {
        setMessage("Status updated.");
      }

      router.refresh();
    } catch (updateError) {
      const text =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update status.";
      setError(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-neutral-200/70 py-10">
      <p className="mb-6 text-xs font-light tracking-wide text-neutral-500">
        Update Status
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          disabled={isLoading}
          className="border-b border-neutral-300 bg-transparent py-2 text-xs font-light text-neutral-800 outline-none disabled:opacity-50"
        >
          {selectableStatuses.map((option) => (
            <option key={option} value={option}>
              {formatAdminLabel(option)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleUpdate}
          disabled={isLoading || status === currentStatus}
          className="py-2 text-xs tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          {isLoading ? "Updating..." : "Update"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-xs font-light text-red-600">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-4 text-xs font-light text-neutral-500">{message}</p>
      ) : null}
    </div>
  );
}
