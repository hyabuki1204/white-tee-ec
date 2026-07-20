"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { getLastViewedProductSlug } from "@/lib/navigation/last-product";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const { checkout: copy } = GRAPHPAPER_STORE_COPY;

export function CheckoutCancelRecovery() {
  const { openDrawer } = useCartDrawer();
  const [lastProductSlug, setLastProductSlug] = useState<string | null>(null);

  useEffect(() => {
    setLastProductSlug(getLastViewedProductSlug());
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={openDrawer}
        className="text-[12px] font-normal tracking-[0.14em] text-neutral-800 transition-opacity hover:opacity-60"
      >
        {copy.backToBag}
      </button>
      {lastProductSlug ? (
        <Link
          href={`/products/${lastProductSlug}`}
          className="text-[12px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
        >
          {copy.backToLastProduct}
        </Link>
      ) : null}
      <Link
        href="/products"
        className="text-[12px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
      >
        {copy.viewProducts}
      </Link>
      <Link
        href="/fabric"
        className="text-[12px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
      >
        {copy.exploreFabric}
      </Link>
    </div>
  );
}
