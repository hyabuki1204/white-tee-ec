"use client";

import { useState } from "react";
import {
  FREE_SHIPPING_THRESHOLD,
  getFreeShippingRemaining,
  getOrderTotal,
  getShippingCost,
} from "@/lib/cart/shipping";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { formatPrice } from "@/lib/utils/format-price";
import { useCartStore } from "@/lib/cart/store";

type UseCheckoutOptions = {
  hasUnavailableItems?: boolean;
  orderNotes?: string;
};

export function useCheckout({
  hasUnavailableItems = false,
  orderNotes = "",
}: UseCheckoutOptions = {}) {
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

  return {
    items,
    subtotal,
    shipping,
    total,
    freeShippingRemaining,
    isLoading,
    error,
    checkoutDisabled,
    hasUnavailableItems,
    handleCheckout,
    copy,
    formatPrice,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
}
