"use client";

import { useLayoutEffect, useState } from "react";
import {
  reconcileCartAgainstStock,
  type CartStockLookup,
} from "@/lib/cart/stock-validation";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { useCartStore } from "@/lib/cart/store";

function itemsEqual(
  left: ReturnType<typeof useCartStore.getState>["items"],
  right: ReturnType<typeof useCartStore.getState>["items"],
): boolean {
  if (left.length !== right.length) return false;

  return left.every((item, index) => {
    const other = right[index];
    return (
      item.productId === other.productId &&
      item.variant === other.variant &&
      item.quantity === other.quantity &&
      item.price === other.price
    );
  });
}

/** Sync cart lines with live stock when the cart UI opens. */
export function useCartReconcile(
  productLookup: CartStockLookup,
  enabled: boolean,
): string | null {
  const [notice, setNotice] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setNotice(null);
      return;
    }

    const currentItems = useCartStore.getState().items;

    if (currentItems.length === 0) {
      setNotice(null);
      return;
    }

    const { nextItems, removedCount, trimmedCount } = reconcileCartAgainstStock(
      currentItems,
      productLookup,
    );

    if (!itemsEqual(currentItems, nextItems)) {
      useCartStore.getState().replaceItems(nextItems);
    }

    if (removedCount > 0) {
      setNotice(SITE_UI_COPY.cart.removedUnavailable(removedCount));
      return;
    }

    if (trimmedCount > 0) {
      setNotice(SITE_UI_COPY.cart.trimmedUnavailable);
      return;
    }

    setNotice(null);
  }, [enabled, productLookup]);

  return notice;
}
