"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils/format-price";
import { useCartStore } from "@/lib/cart/store";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 border-t border-neutral-200/70 pt-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs tracking-wide text-neutral-500">Total</p>
        <p className="text-sm font-light text-neutral-900">
          {formatPrice(total)}
        </p>
      </div>

      {error ? (
        <p className="text-xs font-light text-red-600">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={items.length === 0 || isLoading}
        onClick={handleCheckout}
        className="w-full py-4 text-xs tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}
