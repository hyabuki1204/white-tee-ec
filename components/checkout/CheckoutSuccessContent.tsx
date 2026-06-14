"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { useCartStore } from "@/lib/cart/store";

type CheckoutSuccessContentProps = {
  verified: boolean;
};

const { checkout: copy } = SITE_UI_COPY;

export function CheckoutSuccessContent({ verified }: CheckoutSuccessContentProps) {
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

        <Link
          href="/products"
          className="mt-10 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          {copy.continue}
        </Link>
      </div>
    </Container>
  );
}
