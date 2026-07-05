"use client";

import { CartCheckoutTrust } from "@/components/cart/CartCheckoutTrust";
import { CartCheckoutButton } from "@/components/cart/CartCheckoutButton";
import { useCheckout } from "@/lib/cart/use-checkout";

type CartSummaryProps = {
  hasUnavailableItems?: boolean;
  orderNotes?: string;
  hideCheckoutOnMobile?: boolean;
  prominentCheckout?: boolean;
  showContinueShopping?: boolean;
  onContinueShopping?: () => void;
  /** When false, omit checkout button (e.g. drawer uses a sticky footer). */
  showCheckout?: boolean;
  /** When false, omit top border (nested inside drawer scroll). */
  showTopBorder?: boolean;
};

export function CartSummary({
  hasUnavailableItems = false,
  orderNotes = "",
  hideCheckoutOnMobile = false,
  prominentCheckout = false,
  showContinueShopping = false,
  onContinueShopping,
  showCheckout = true,
  showTopBorder = true,
}: CartSummaryProps) {
  const checkout = useCheckout({ hasUnavailableItems, orderNotes });
  const { copy } = checkout;

  return (
    <div
      className={
        showTopBorder
          ? "space-y-6 border-t border-neutral-200/70 pt-8 sm:space-y-8 sm:pt-10"
          : "space-y-6 sm:space-y-8"
      }
    >
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] tracking-wide text-neutral-600 md:text-[13px] md:text-neutral-600">
            {copy.subtotal}
          </p>
          <p className="text-[14px] font-light text-neutral-800 md:text-[13px]">
            {checkout.formatPrice(checkout.subtotal)}
          </p>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-[14px] tracking-wide text-neutral-600 md:text-[13px] md:text-neutral-600">
            {copy.shipping}
          </p>
          <p className="text-[14px] font-light text-neutral-800 md:text-[13px]">
            {checkout.shipping === 0 && checkout.subtotal > 0
              ? copy.shippingFree
              : checkout.shipping === 0
                ? checkout.formatPrice(0)
                : copy.shippingFlat}
          </p>
        </div>

        {checkout.subtotal > 0 &&
        checkout.subtotal < checkout.freeShippingThreshold ? (
          <p className="text-[12px] font-light tracking-[0.04em] text-neutral-600 md:text-[12px]">
            {copy.freeShippingProgress(
              checkout.formatPrice(checkout.freeShippingRemaining),
            )}
          </p>
        ) : null}

        {checkout.subtotal >= checkout.freeShippingThreshold ? (
          <p className="text-[12px] font-light tracking-[0.04em] text-neutral-600 md:text-[12px]">
            {copy.freeShippingReached}
          </p>
        ) : null}

        <div className="flex items-baseline justify-between pt-2">
          <p className="text-[14px] tracking-wide text-neutral-600 md:text-[13px] md:text-neutral-600">
            {copy.total}
          </p>
          <p className="text-[16px] font-light text-neutral-800 md:text-sm md:text-neutral-900">
            {checkout.formatPrice(checkout.total)}
          </p>
        </div>

        <p className="text-[12px] font-light tracking-[0.04em] text-neutral-600 md:text-[12px]">
          {copy.taxIncluded}
        </p>
      </div>

      <p className="text-[12px] font-light leading-[1.8] tracking-[0.04em] text-neutral-600 md:text-[12px]">
        {copy.shippingNote}
      </p>

      {checkout.hasUnavailableItems ? (
        <p className="text-[12px] font-light text-neutral-600 md:text-[12px]">
          {copy.checkoutBlocked}
        </p>
      ) : null}

      {checkout.error ? (
        <p className="text-[14px] font-light text-red-600 md:text-[13px]">
          {checkout.error}
        </p>
      ) : null}

      <CartCheckoutTrust />

      {showCheckout ? (
        <div className={hideCheckoutOnMobile ? "hidden lg:block" : undefined}>
          <CartCheckoutButton
            label={copy.checkout}
            loadingLabel={copy.processing}
            disabled={checkout.checkoutDisabled}
            isLoading={checkout.isLoading}
            onClick={checkout.handleCheckout}
            prominent={prominentCheckout}
          />
        </div>
      ) : null}

      {showContinueShopping && onContinueShopping ? (
        <button
          type="button"
          onClick={onContinueShopping}
          className="w-full py-2 text-[12px] font-light tracking-[0.1em] text-neutral-600 transition-opacity hover:opacity-60"
        >
          {copy.continueShopping}
        </button>
      ) : null}
    </div>
  );
}
