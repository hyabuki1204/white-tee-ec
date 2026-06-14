"use client";

import { useEffect, useRef } from "react";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnDanger,
  adminBtnSecondary,
  adminSectionTitle,
} from "@/lib/admin/ui";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = ADMIN_COPY.common.delete,
  onConfirm,
  onCancel,
  isLoading = false,
}: AdminConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-message"
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className={adminSectionTitle}>
          {title}
        </h2>
        <p id="admin-confirm-message" className="text-sm text-neutral-700">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={adminBtnSecondary}
          >
            {ADMIN_COPY.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={adminBtnDanger}
          >
            {isLoading ? ADMIN_COPY.products.processing : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
