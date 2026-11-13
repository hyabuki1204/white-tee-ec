"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CartFabricCrossSell } from "@/components/cart/CartFabricCrossSell";
import { CheckoutOrderSummaryDisplay } from "@/components/checkout/CheckoutOrderSummary";
import { PageHeader } from "@/components/layout/PageHeader";
import type { CheckoutOrderSummary } from "@/lib/checkout/session-summary";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  pageGutterClass,
} from "@/lib/store-ui/ui-classes";
import { useCartStore } from "@/lib/cart/store";
import type { Product } from "@/types";

type CheckoutSuccessContentProps = {
  verified: boolean;
  sessionId?: string | null;
  orderSummary?: CheckoutOrderSummary | null;
  crossSellProducts?: Product[];
  fabricNameBySlug?: Record<string, string>;
};

const { checkout: copy } = GRAPHPAPER_STORE_COPY;

export function CheckoutSuccessContent({
  verified,
  sessionId,
  orderSummary,
  crossSellProducts = [],
  fabricNameBySlug = {},
}: CheckoutSuccessContentProps) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (verified) {
      clearCart();
    }
  }, [verified, clearCart]);

  if (!verified) {
    return (
      <>
        <PageHeader
          label="Checkout"
          title={copy.paymentPending}
          lead={copy.paymentUnconfirmed}
        />
        <section
          className={`${pageGutterClass} py-[var(--space-5)] md:py-[var(--space-6)]`}
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/cart" className={buttonPrimaryClass}>
              {copy.backToBag}
            </Link>
            <Link href="/contact" className={buttonSecondaryClass}>
              {GRAPHPAPER_STORE_COPY.footer.contact}
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        label="Order confirmed"
        title={copy.thankYou}
        lead={copy.orderConfirmed}
      />

      <section
        className={`${pageGutterClass} grid gap-12 py-[var(--space-5)] md:grid-cols-12 md:items-start md:gap-0 md:py-[var(--space-6)]`}
      >
        <div className="md:col-span-6">
          {sessionId ? (
            <dl className="border-t border-[var(--color-ink)] pt-4">
              <dt className="type-caption">{copy.orderIdLabel}</dt>
              <dd className="mt-2 font-en text-[clamp(28px,4.4vw,48px)] font-light leading-none tracking-[0.02em] tabular-nums text-[var(--color-ink)]">
                {sessionId.slice(-8).toUpperCase()}
              </dd>
            </dl>
          ) : null}

          <ol className="mt-10 space-y-5">
            {copy.steps.map((step, index) => (
              <li key={step} className="grid grid-cols-[2.5rem_1fr] items-baseline">
                <span className="type-label tabular-nums !text-[var(--color-navy)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="type-body text-[var(--color-ink)]">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/products" className={buttonPrimaryClass}>
              {copy.viewProducts}
            </Link>
            <Link href="/store-guide" className={buttonSecondaryClass}>
              {GRAPHPAPER_STORE_COPY.footer.storeGuide}
            </Link>
          </div>
        </div>

        {orderSummary ? (
          <aside
            aria-label={copy.orderSummaryLabel}
            className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 sm:p-8 md:col-span-5 md:col-start-8"
          >
            <p className="type-label !text-[var(--color-navy)]">Summary</p>
            <h2 className="mt-2 text-[16px] font-bold tracking-[0.08em] text-[var(--color-ink)]">
              {copy.orderSummaryLabel}
            </h2>
            <div className="mt-6">
              <CheckoutOrderSummaryDisplay summary={orderSummary} />
            </div>
          </aside>
        ) : null}
      </section>

      {crossSellProducts.length > 0 ? (
        <div className={`${pageGutterClass} pb-[var(--space-6)]`}>
          <CartFabricCrossSell
            products={crossSellProducts}
            fabricNameBySlug={fabricNameBySlug}
            className="border-t border-[var(--color-hairline)] pt-[var(--space-5)]"
          />
        </div>
      ) : null}
    </>
  );
}
