"use client";

import { ApproxPrice } from "@/components/currency/ApproxPrice";
import { CurrencySwitch } from "@/components/currency/CurrencySwitch";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { CartCheckoutTrust } from "@/components/cart/CartCheckoutTrust";
import { CartCheckoutButton } from "@/components/cart/CartCheckoutButton";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart/shipping";
import { useCheckout } from "@/lib/cart/use-checkout";
import { getCurrencyCopy } from "@/lib/currency/copy";
import { SHIPS_WITHIN_JAPAN_ONLY } from "@/lib/store-ui/returns-policy";

type CartSummaryProps = {
  hasUnavailableItems?: boolean;
  orderNotes?: string;
  hideCheckoutOnMobile?: boolean;
  /** When false, omit checkout button (e.g. drawer uses a sticky footer). */
  showCheckout?: boolean;
  /** When false, omit the terms block (shipping, returns, payment). */
  showTrust?: boolean;
};

const rowClass = "flex items-baseline justify-between gap-4";
const valueClass =
  "font-en text-[15px] tracking-[0.02em] tabular-nums text-[var(--color-ink)]";

export function CartSummary({
  hasUnavailableItems = false,
  orderNotes = "",
  hideCheckoutOnMobile = false,
  showCheckout = true,
  showTrust = true,
}: CartSummaryProps) {
  const locale = useLocale();
  const currencyCopy = getCurrencyCopy(locale);
  const checkout = useCheckout({ hasUnavailableItems, orderNotes });
  const { copy } = checkout;
  const belowThreshold =
    checkout.subtotal > 0 && checkout.subtotal < FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(
    100,
    Math.round((checkout.subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <div className="space-y-6">
      <dl className="space-y-3">
        <div className={rowClass}>
          <dt className="type-body text-[var(--color-ink-soft)]">
            {copy.subtotal}
          </dt>
          <dd className={valueClass}>
            {checkout.formatPrice(checkout.subtotal)}
          </dd>
        </div>

        <div className={rowClass}>
          <dt className="type-body text-[var(--color-ink-soft)]">
            {copy.shipping}
          </dt>
          <dd className={valueClass}>
            {checkout.shipping === 0 && checkout.subtotal > 0 ? (
              <span className="font-[family-name:var(--font-sans-jp)] text-[14px]">
                {copy.shippingFree}
              </span>
            ) : (
              checkout.formatPrice(checkout.shipping)
            )}
          </dd>
        </div>

        {checkout.subtotal > 0 && !belowThreshold ? (
          <p className="type-caption">{copy.freeShippingReached}</p>
        ) : null}

        {belowThreshold ? (
          <div>
            <div
              aria-hidden
              className="h-px w-full bg-[var(--color-hairline)]"
            >
              <div
                className="h-px bg-[var(--color-navy)] transition-[width] duration-[var(--duration-reveal)] ease-[var(--ease-quiet)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="type-caption mt-2">
              {copy.freeShippingProgress(
                checkout.formatPrice(checkout.freeShippingRemaining),
              )}
            </p>
          </div>
        ) : null}

        <div
          className={`${rowClass} border-t border-[var(--color-ink)] pt-4`}
        >
          <dt className="text-[14px] font-bold tracking-[0.08em] text-[var(--color-ink)]">
            {copy.total}
            <span className="type-caption ml-2 font-normal">
              {copy.taxIncluded}
            </span>
          </dt>
          <dd className="font-en text-[26px] leading-none tracking-[0.01em] tabular-nums text-[var(--color-ink)]">
            {checkout.formatPrice(checkout.total)}
          </dd>
        </div>
        {locale === "en" && checkout.total > 0 ? (
          <p className="text-right">
            <ApproxPrice amount={checkout.total} className="text-[14px]" />
          </p>
        ) : null}
      </dl>

      {locale === "en" ? (
        <div className="space-y-1 border-t border-[var(--color-hairline)] pt-4">
          <p className="type-caption text-[var(--color-ink)]">
            {SHIPS_WITHIN_JAPAN_ONLY}
          </p>
          <p className="type-caption">{currencyCopy.chargedInYen}</p>
          <p className="type-caption flex items-center gap-3">
            <span>{currencyCopy.estimatesIn}</span>
            <CurrencySwitch />
          </p>
        </div>
      ) : null}

      {checkout.hasUnavailableItems ? (
        <p role="alert" className="type-caption !text-red-700">
          {copy.checkoutBlocked}
        </p>
      ) : null}

      {showCheckout && checkout.error ? (
        <p role="alert" className="type-body text-red-700">
          {checkout.error}
        </p>
      ) : null}

      {showCheckout ? (
        <div className={hideCheckoutOnMobile ? "hidden lg:block" : undefined}>
          <CartCheckoutButton
            label={copy.checkout}
            loadingLabel={copy.processing}
            disabled={checkout.checkoutDisabled}
            isLoading={checkout.isLoading}
            onClick={checkout.handleCheckout}
          />
        </div>
      ) : null}

      {showTrust ? <CartCheckoutTrust /> : null}
    </div>
  );
}
