"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnDanger,
  adminError,
  adminSection,
  adminSectionTitle,
  adminSuccess,
} from "@/lib/admin/ui";

type ProductDeleteButtonProps = {
  productId: string;
  productName: string;
  hasOrders: boolean;
};

export function ProductDeleteButton({
  productId,
  productName,
  hasOrders,
}: ProductDeleteButtonProps) {
  const router = useRouter();
  const copy = ADMIN_COPY.products;
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmMessage = hasOrders
    ? copy.unpublishConfirm(productName)
    : copy.deleteConfirm(productName);

  const handleDelete = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        error?: string;
        action?: string;
        reason?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? copy.deleteFailed);
      }

      setConfirmOpen(false);

      if (data.action === "archived") {
        setMessage(data.reason ?? "商品を非公開にしました。");
        router.refresh();
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (deleteError) {
      const text =
        deleteError instanceof Error ? deleteError.message : copy.deleteFailed;
      setError(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className={`${adminSection} mt-6 border-red-100`}>
        <h2 className={adminSectionTitle}>
          {hasOrders ? copy.unpublish : copy.deleteTitle}
        </h2>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isLoading}
          className={adminBtnDanger}
        >
          {isLoading
            ? copy.processing
            : hasOrders
              ? copy.unpublish
              : ADMIN_COPY.common.delete}
        </button>
        {error ? <p className={`${adminError} mt-4`}>{error}</p> : null}
        {message ? <p className={`${adminSuccess} mt-4`}>{message}</p> : null}
      </section>

      <AdminConfirmDialog
        open={confirmOpen}
        title={hasOrders ? copy.unpublish : copy.deleteTitle}
        message={confirmMessage}
        confirmLabel={hasOrders ? copy.unpublish : ADMIN_COPY.common.delete}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
}
