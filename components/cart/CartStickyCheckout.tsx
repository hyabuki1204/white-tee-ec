"use client";

import { CartCheckoutButton } from "@/components/cart/CartCheckoutButton";
import { useCheckout } from "@/lib/cart/use-checkout";

type CartStickyCheckoutProps = {
  hasUnavailableItems?: boolean;
  orderNotes?: string;
};

/** Phone and tablet: total and the checkout action stay within reach. */
export function CartStickyCheckout({
  hasUnavailableItems = false,
  orderNotes = "",
}: CartStickyCheckoutProps) {
  const checkout = useCheckout({ hasUnavailableItems, orderNotes });

  if (checkout.items.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-hairline)] bg-[var(--color-surface)] px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
      {checkout.error ? (
        <p role="alert" className="type-caption mb-2 !text-red-700">
          {checkout.error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="type-caption">
            {checkout.copy.total}（{checkout.copy.taxIncluded}）
          </p>
          <p className="font-en text-[22px] leading-tight tracking-[0.01em] tabular-nums text-[var(--color-ink)]">
            {checkout.formatPrice(checkout.total)}
          </p>
        </div>

        <CartCheckoutButton
          label={checkout.copy.checkout}
          loadingLabel={checkout.copy.processing}
          disabled={checkout.checkoutDisabled}
          isLoading={checkout.isLoading}
          onClick={checkout.handleCheckout}
          className="!min-h-12 !w-auto flex-1 max-w-[13rem]"
        />
      </div>
    </div>
  );
}
