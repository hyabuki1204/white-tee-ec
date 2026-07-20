"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import {
  getGraphpaperDisplayName,
  STORE_BRAND_LINE,
} from "@/lib/products/display-name";
import { formatPrice } from "@/lib/utils/format-price";

type MobilePurchaseBarProps = {
  fabricName?: string | null;
};

export function MobilePurchaseBar({ fabricName }: MobilePurchaseBarProps) {
  const {
    product,
    selectedSize,
    buttonLabel,
    handleAddToCart,
    purchaseCtaRef,
  } = useProductPurchase();
  const [inlineCtaVisible, setInlineCtaVisible] = useState(true);

  const displayName = getGraphpaperDisplayName(product, fabricName);

  useEffect(() => {
    const target = purchaseCtaRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInlineCtaVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0.15, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [purchaseCtaRef]);

  if (inlineCtaVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/70 bg-background/95 px-6 py-3 backdrop-blur-sm lg:hidden"
      aria-label="Quick purchase"
    >
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-normal tracking-[0.12em] text-neutral-600">
            {STORE_BRAND_LINE}
          </p>
          <p className="truncate text-[14px] font-normal tracking-[0.03em] text-neutral-900">
            {displayName}
          </p>
          <p className="text-[14px] font-normal tracking-[0.04em] text-neutral-700">
            {formatPrice(product.price)}
            {selectedSize ? ` · ${selectedSize}` : null}
          </p>
        </div>
        <AddToCartButton
          disabled={!selectedSize}
          onAdd={handleAddToCart}
          label={buttonLabel}
          compact
        />
      </div>
    </div>
  );
}
