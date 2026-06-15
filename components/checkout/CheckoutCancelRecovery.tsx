"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLastViewedProductSlug } from "@/lib/navigation/last-product";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

const { checkout: copy } = SITE_UI_COPY;

export function CheckoutCancelRecovery() {
  const [lastProductSlug, setLastProductSlug] = useState<string | null>(null);

  useEffect(() => {
    setLastProductSlug(getLastViewedProductSlug());
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <Link
        href="/cart"
        className="text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        {copy.backToBag}
      </Link>
      {lastProductSlug ? (
        <Link
          href={`/products/${lastProductSlug}`}
          className="text-[11px] font-light tracking-[0.06em] text-neutral-500 transition-opacity duration-300 hover:opacity-60"
        >
          {copy.backToLastProduct}
        </Link>
      ) : null}
      <Link
        href="/products"
        className="text-[11px] font-light tracking-[0.06em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
      >
        {copy.viewProducts}
      </Link>
      <Link
        href="/fabric"
        className="text-[11px] font-light tracking-[0.06em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
      >
        {copy.exploreFabric}
      </Link>
    </div>
  );
}
