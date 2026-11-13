"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import {
  reconcileCartAgainstStock,
  type CartStockLookup,
} from "@/lib/cart/stock-validation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import { useCartStore } from "@/lib/cart/store";

type CartItems = ReturnType<typeof useCartStore.getState>["items"];

function itemsEqual(left: CartItems, right: CartItems): boolean {
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

type StickyNotice = { lookup: CartStockLookup; message: string };

/**
 * Sync cart lines with live stock while the cart UI is open.
 *
 * The reconcile result is derived during render; the effect only writes the
 * corrected lines back to the cart store. The notice is remembered so it
 * stays visible after the store has been corrected (at which point a fresh
 * reconcile reports nothing to fix).
 */
export function useCartReconcile(
  productLookup: CartStockLookup,
  enabled: boolean,
): string | null {
  const copy = getSiteUiCopy(useLocale()).cart;
  const items = useCartStore((state) => state.items);
  const [sticky, setSticky] = useState<StickyNotice | null>(null);

  const result = useMemo(
    () =>
      enabled && items.length > 0
        ? reconcileCartAgainstStock(items, productLookup)
        : null,
    [enabled, items, productLookup],
  );

  const message = !result
    ? null
    : result.removedCount > 0
      ? copy.removedUnavailable(result.removedCount)
      : result.trimmedCount > 0
        ? copy.trimmedUnavailable
        : null;

  // Adjust remembered state during render (no effect needed).
  if (!enabled) {
    if (sticky) setSticky(null);
  } else if (
    message &&
    (sticky?.message !== message || sticky.lookup !== productLookup)
  ) {
    setSticky({ lookup: productLookup, message });
  }

  useLayoutEffect(() => {
    if (result && !itemsEqual(items, result.nextItems)) {
      useCartStore.getState().replaceItems(result.nextItems);
    }
  }, [items, result]);

  if (!enabled) return null;
  if (message) return message;
  return sticky && sticky.lookup === productLookup ? sticky.message : null;
}
