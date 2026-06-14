"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { formatOrderStatusLabel } from "@/lib/admin/format";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin/order-status-options";
import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminSection,
  adminSectionTitle,
  adminSuccess,
} from "@/lib/admin/ui";
import type { OrderStatus } from "@/types/database";

type OrderStatusUpdaterProps = {
  orderId: string;
  currentStatus: OrderStatus;
  resendConfigured: boolean;
};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  resendConfigured,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const copy = ADMIN_COPY.orders;
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
        throw new Error(data.error ?? copy.statusUpdateFailed);
      }

      if (status === "shipped") {
        if (data.email?.sent) {
          setMessage("ステータスを更新しました。発送通知メールを送信しました。");
        } else if (data.email?.reason === "not_configured") {
          setMessage(
            "ステータスを更新しました。メール未設定（RESEND_API_KEY を設定してください）。",
          );
        } else if (data.email?.reason === "missing_email") {
          setMessage(
            "ステータスを更新しました。注文にメールアドレスがありません。",
          );
        } else {
          setMessage(copy.statusUpdated);
        }
      } else {
        setMessage(copy.statusUpdated);
      }

      router.refresh();
    } catch (updateError) {
      const text =
        updateError instanceof Error
          ? updateError.message
          : copy.statusUpdateFailed;
      setError(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={adminSection}>
      <h2 className={adminSectionTitle}>{copy.updateStatus}</h2>

      {!resendConfigured ? (
        <p className={`${adminMuted} mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3`}>
          {copy.resendNotConfigured}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className={`${adminField} sm:w-52`}>
          <span className={adminLabel}>{copy.status}</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as OrderStatus)}
            disabled={isLoading}
            className={adminInput}
          >
            {selectableStatuses.map((option) => (
              <option key={option} value={option}>
                {formatOrderStatusLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleUpdate}
          disabled={isLoading || status === currentStatus}
          className={adminBtnPrimary}
        >
          {isLoading ? copy.updating : copy.updateStatus}
        </button>
      </div>

      {error ? <p className={`${adminError} mt-4`}>{error}</p> : null}
      {message ? <p className={`${adminSuccess} mt-4`}>{message}</p> : null}
    </section>
  );
}
