"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { formatPrice } from "@/lib/utils/format-price";

export function MobilePurchaseBar() {
  const {
    product,
    selectedSize,
    canAdd,
    buttonLabel,
    handleAddToCart,
    purchaseCtaRef,
  } = useProductPurchase();
  const [inlineCtaVisible, setInlineCtaVisible] = useState(true);
  const { product: copy } = SITE_UI_COPY;

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
          <p className="truncate text-[11px] font-light tracking-[0.06em] text-neutral-600">
            {selectedSize ? copy.sizeSelected(selectedSize) : copy.selectSize}
          </p>
          <p className="text-[13px] font-light tracking-[0.04em] text-neutral-800">
            {formatPrice(product.price)}
          </p>
        </div>
        <AddToCartButton
          disabled={!canAdd}
          onAdd={handleAddToCart}
          label={buttonLabel}
          compact
        />
      </div>
    </div>
  );
}
