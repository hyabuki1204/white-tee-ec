"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { useCartStore } from "@/lib/cart/store";

type CheckoutSuccessContentProps = {
  verified: boolean;
};

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
              Thank you
            </p>
            <p className="mt-6 text-sm font-light text-neutral-700">
              ご注文ありがとうございます。確認メールをお送りしました。
            </p>
          </>
        ) : (
          <>
            <p className="text-xs tracking-[0.3em] text-neutral-500">
              Payment pending
            </p>
            <p className="mt-6 text-sm font-light text-neutral-700">
              お支払いの確認が取れていません。カートはそのまま残っています。
            </p>
          </>
        )}

        <Link
          href="/products"
          className="mt-10 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          Continue Shopping
        </Link>
      </div>
    </Container>
  );
}
