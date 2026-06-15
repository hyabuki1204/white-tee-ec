"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { useCartStore } from "@/lib/cart/store";

type CheckoutSuccessContentProps = {
  verified: boolean;
  sessionId?: string | null;
};

const { checkout: copy } = SITE_UI_COPY;

export function CheckoutSuccessContent({
  verified,
  sessionId,
}: CheckoutSuccessContentProps) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (verified) {
      clearCart();
    }
  }, [verified, clearCart]);

  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        {verified ? (
          <>
            <p className="text-xs tracking-[0.3em] text-neutral-500">
              {copy.thankYou}
            </p>
            <p className="mt-6 text-sm font-light text-neutral-700">
              {copy.orderConfirmed}
            </p>
            {sessionId ? (
              <p className="mt-3 text-[11px] font-light tracking-[0.06em] text-neutral-400">
                {copy.orderId(sessionId.slice(-8).toUpperCase())}
              </p>
            ) : null}
            <p className="mt-4 text-[11px] font-light tracking-[0.04em] text-neutral-500">
              {copy.nextSteps}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs tracking-[0.3em] text-neutral-500">
              {copy.paymentPending}
            </p>
            <p className="mt-6 text-sm font-light text-neutral-700">
              {copy.paymentUnconfirmed}
            </p>
          </>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/products"
            className="text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
          >
            {copy.continue}
          </Link>
          {verified ? (
            <Link
              href="/fabric"
              className="text-[11px] font-light tracking-[0.06em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
            >
              {copy.exploreFabric}
            </Link>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
