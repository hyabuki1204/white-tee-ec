"use client";

import { useState } from "react";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import {
  FREE_SHIPPING_THRESHOLD,
  getFreeShippingRemaining,
  getOrderTotal,
  getShippingCost,
} from "@/lib/cart/shipping";
import { formatPrice } from "@/lib/utils/format-price";
import { useCartStore } from "@/lib/cart/store";

type CartSummaryProps = {
  hasUnavailableItems?: boolean;
  orderNotes?: string;
};

export function CartSummary({
  hasUnavailableItems = false,
  orderNotes = "",
}: CartSummaryProps) {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart: copy } = GRAPHPAPER_STORE_COPY;

  const subtotal = getTotal();
  const shipping = getShippingCost(subtotal);
  const total = getOrderTotal(subtotal);
  const freeShippingRemaining = getFreeShippingRemaining(subtotal);
  const checkoutDisabled =
    items.length === 0 || isLoading || hasUnavailableItems;

  const handleCheckout = async () => {
    if (checkoutDisabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderNotes: orderNotes.trim() || undefined,
        }),
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
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] tracking-wide text-neutral-600 md:text-xs md:text-neutral-500">
            {copy.subtotal}
          </p>
          <p className="text-[13px] font-light text-neutral-800 md:text-xs">
            {formatPrice(subtotal)}
          </p>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-[13px] tracking-wide text-neutral-600 md:text-xs md:text-neutral-500">
            {copy.shipping}
          </p>
          <p className="text-[13px] font-light text-neutral-800 md:text-xs">
            {shipping === 0 && subtotal > 0
              ? copy.shippingFree
              : shipping === 0
                ? formatPrice(0)
                : copy.shippingFlat}
          </p>
        </div>

        {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? (
          <p className="text-[11px] font-light tracking-[0.04em] text-neutral-400 md:text-[10px]">
            {copy.freeShippingProgress(formatPrice(freeShippingRemaining))}
          </p>
        ) : null}

        {subtotal >= FREE_SHIPPING_THRESHOLD ? (
          <p className="text-[11px] font-light tracking-[0.04em] text-neutral-400 md:text-[10px]">
            {copy.freeShippingReached}
          </p>
        ) : null}

        <div className="flex items-baseline justify-between pt-2">
          <p className="text-[13px] tracking-wide text-neutral-600 md:text-xs md:text-neutral-500">
            {copy.total}
          </p>
          <p className="text-[15px] font-light text-neutral-800 md:text-sm md:text-neutral-900">
            {formatPrice(total)}
          </p>
        </div>

        <p className="text-[11px] font-light tracking-[0.04em] text-neutral-400 md:text-[10px]">
          {copy.taxIncluded}
        </p>
      </div>

      <p className="text-[11px] font-light leading-[1.8] tracking-[0.04em] text-neutral-400 md:text-[10px]">
        {copy.shippingNote}
      </p>

      {hasUnavailableItems ? (
        <p className="text-[11px] font-light text-neutral-500 md:text-[10px]">
          {copy.checkoutBlocked}
        </p>
      ) : null}

      {error ? (
        <p className="text-[13px] font-light text-red-600 md:text-xs">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={checkoutDisabled}
        onClick={handleCheckout}
        className="w-full min-h-12 py-4 text-[13px] tracking-[0.16em] text-neutral-800 transition-opacity active:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-300 md:min-h-0 md:text-xs md:tracking-[0.2em] md:text-neutral-900 md:hover:opacity-60"
      >
        {isLoading ? copy.processing : copy.checkout}
      </button>
    </div>
  );
}
