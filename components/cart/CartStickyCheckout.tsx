"use client";

import { CartCheckoutButton } from "@/components/cart/CartCheckoutButton";
import { CartCheckoutTrust } from "@/components/cart/CartCheckoutTrust";
import { useCheckout } from "@/lib/cart/use-checkout";

type CartStickyCheckoutProps = {
  hasUnavailableItems?: boolean;
  orderNotes?: string;
};

export function CartStickyCheckout({
  hasUnavailableItems = false,
  orderNotes = "",
}: CartStickyCheckoutProps) {
  const checkout = useCheckout({ hasUnavailableItems, orderNotes });

  if (checkout.items.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/70 bg-background/95 px-6 py-4 backdrop-blur-sm lg:hidden">
      <div className="mx-auto max-w-xl space-y-3">
        <CartCheckoutTrust compact />
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-light tracking-[0.1em] text-neutral-600">
              {checkout.copy.total}
            </p>
            <p className="text-[16px] font-light tracking-[0.04em] text-neutral-800">
              {checkout.formatPrice(checkout.total)}
            </p>
          </div>

          <div className="w-[min(52%,11rem)] shrink-0">
            <CartCheckoutButton
              label={checkout.copy.checkout}
              loadingLabel={checkout.copy.processing}
              disabled={checkout.checkoutDisabled}
              isLoading={checkout.isLoading}
              onClick={checkout.handleCheckout}
              prominent
            />
          </div>
        </div>
      </div>

      {checkout.error ? (
        <p className="mx-auto mt-3 max-w-xl text-[12px] font-light text-red-600">
          {checkout.error}
        </p>
      ) : null}
    </div>
  );
}
