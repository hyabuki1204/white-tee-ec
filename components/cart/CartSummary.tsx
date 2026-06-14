"use client";

import { useState } from "react";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { formatPrice } from "@/lib/utils/format-price";
import { useCartStore } from "@/lib/cart/store";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart: copy } = SITE_UI_COPY;

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
        throw new Error(data.error ?? copy.checkoutFailed);
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : copy.checkoutFailed;
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 border-t border-neutral-200/70 pt-8 sm:space-y-8 sm:pt-10">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] tracking-wide text-neutral-600 md:text-xs md:text-neutral-500">
          {copy.total}
        </p>
        <p className="text-[15px] font-light text-neutral-800 md:text-sm md:text-neutral-900">
          {formatPrice(total)}
        </p>
      </div>

      {error ? (
        <p className="text-[13px] font-light text-red-600 md:text-xs">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={items.length === 0 || isLoading}
        onClick={handleCheckout}
        className="w-full min-h-12 py-4 text-[13px] tracking-[0.16em] text-neutral-800 transition-opacity active:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-300 md:min-h-0 md:text-xs md:tracking-[0.2em] md:text-neutral-900 md:hover:opacity-60"
      >
        {isLoading ? copy.processing : copy.checkout}
      </button>
    </div>
  );
}
