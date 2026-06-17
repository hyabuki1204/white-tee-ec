"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { CartFabricCrossSell } from "@/components/cart/CartFabricCrossSell";
import { CheckoutOrderSummaryDisplay } from "@/components/checkout/CheckoutOrderSummary";
import { Container } from "@/components/layout/Container";
import type { CheckoutOrderSummary } from "@/lib/checkout/session-summary";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
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

  return (
    <Container as="section" className="py-16 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="relative mx-auto aspect-[4/3] max-w-sm overflow-hidden bg-[#f4f4f2]">
          <Image
            src="/store/store-empty-state.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 90vw, 384px"
            className="object-cover opacity-85"
          />
        </div>

        {verified ? (
          <>
            <p className="mt-10 text-[11px] font-light tracking-[0.28em] text-neutral-500">
              {copy.thankYou}
            </p>
            <p className="mt-4 text-[13px] font-light leading-[1.8] tracking-[0.03em] text-neutral-800">
              {copy.orderConfirmed}
            </p>
            {sessionId ? (
              <p className="mt-3 text-[10px] font-light tracking-[0.1em] text-neutral-400">
                {copy.orderId(sessionId.slice(-8).toUpperCase())}
              </p>
            ) : null}
            <p className="mt-4 text-[11px] font-light leading-[1.7] tracking-[0.04em] text-neutral-500">
              {copy.nextSteps}
            </p>
            {orderSummary ? (
              <div className="mt-8 border-t border-neutral-200/70 pt-8 text-left">
                <p className="text-[10px] font-light tracking-[0.14em] text-neutral-400">
                  {copy.orderSummaryLabel}
                </p>
                <CheckoutOrderSummaryDisplay summary={orderSummary} />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-10 text-[11px] font-light tracking-[0.28em] text-neutral-500">
              {copy.paymentPending}
            </p>
            <p className="mt-4 text-[13px] font-light leading-[1.8] tracking-[0.03em] text-neutral-700">
              {copy.paymentUnconfirmed}
            </p>
          </>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/products?sleeve=short"
            className="text-[11px] font-light tracking-[0.14em] text-neutral-800 transition-opacity hover:opacity-60"
          >
            {copy.viewProducts}
          </Link>
          {verified ? (
            <Link
              href="/store-guide"
              className="text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
            >
              {GRAPHPAPER_STORE_COPY.footer.storeGuide}
            </Link>
          ) : null}
        </div>

        {verified && crossSellProducts.length > 0 ? (
          <div className="mx-auto mt-16 max-w-4xl border-t border-neutral-200/70 pt-12 text-left">
            <CartFabricCrossSell
              products={crossSellProducts}
              fabricNameBySlug={fabricNameBySlug}
            />
          </div>
        ) : null}
      </div>
    </Container>
  );
}
