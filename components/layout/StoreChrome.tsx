"use client";

import { Suspense } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartDrawerProvider } from "@/components/cart/CartDrawerContext";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import type { Product } from "@/types";

type StoreChromeProps = {
  children: React.ReactNode;
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

function HeaderFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/70 bg-background">
      <div className="h-[var(--header-height,4.5rem)]" aria-hidden />
    </header>
  );
}

export function StoreChrome({
  children,
  products,
  fabricNameBySlug,
}: StoreChromeProps) {
  return (
    <CartDrawerProvider products={products} fabricNameBySlug={fabricNameBySlug}>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <Main>{children}</Main>
      <Footer />
      <CartDrawer />
    </CartDrawerProvider>
  );
}
