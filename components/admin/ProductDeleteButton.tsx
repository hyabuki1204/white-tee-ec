"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const prompt = hasOrders
      ? `"${productName}" has order history and will be unpublished instead of deleted. Continue?`
      : `Delete "${productName}"? This cannot be undone.`;

    if (!window.confirm(prompt)) {
      return;
    }

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
        throw new Error(data.error ?? "Failed to delete product.");
      }

      if (data.action === "archived") {
        setMessage(data.reason ?? "Product unpublished.");
        router.refresh();
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (deleteError) {
      const text =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete product.";
      setError(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-neutral-200/70 pt-10">
      <p className="mb-4 text-xs font-light tracking-wide text-neutral-500">
        {hasOrders ? "Unpublish Product" : "Delete Product"}
      </p>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isLoading}
        className="text-xs tracking-[0.12em] text-red-700 transition-opacity hover:opacity-60 disabled:text-neutral-300"
      >
        {isLoading
          ? "Processing..."
          : hasOrders
            ? "Unpublish"
            : "Delete"}
      </button>
      {error ? (
        <p className="mt-4 text-xs font-light text-red-600">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-4 text-xs font-light text-neutral-500">{message}</p>
      ) : null}
    </div>
  );
}
