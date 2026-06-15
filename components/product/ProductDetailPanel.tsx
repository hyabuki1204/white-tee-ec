"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ProductPurchaseReassurance } from "@/components/product/ProductPurchaseReassurance";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { VariantSelector } from "@/components/product/VariantSelector";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { ProductDetailContent } from "@/types";

type ProductDetailPanelProps = {
  detail: ProductDetailContent;
  /** When false, only render purchase block (tabs rendered separately). */
  includeTabs?: boolean;
};

function PurchaseStatus() {
  const {
    selectedSize,
    isOutOfStock,
    maxQuantity,
    inCartQuantity,
  } = useProductPurchase();
  const { product: copy } = SITE_UI_COPY;

  if (!selectedSize) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400 md:text-[10px]">
        {copy.chooseSize}
      </p>
    );
  }

  if (isOutOfStock) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400 md:text-[10px]">
        {copy.unavailable}
      </p>
    );
  }

  if (maxQuantity < 1) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400 md:text-[10px]">
        {copy.allInBag}
      </p>
    );
  }

  if (inCartQuantity > 0) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400 md:text-[10px]">
        {copy.inBagMore(inCartQuantity, maxQuantity)}
      </p>
    );
  }

  if (maxQuantity <= 5) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400 md:text-[10px]">
        {copy.qtyLeft(maxQuantity)}
      </p>
    );
  }

  return <div className="min-h-[1rem]" aria-hidden />;
}

export function ProductDetailPanel({
  detail,
  includeTabs = true,
}: ProductDetailPanelProps) {
  const {
    product,
    selectedSize,
    quantity,
    setQuantity,
    maxQuantity,
    canAdd,
    buttonLabel,
    handleAddToCart,
    isAdded,
    purchaseCtaRef,
  } = useProductPurchase();
  const { product: copy } = SITE_UI_COPY;

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20">
      <section aria-label="Purchase options" className="space-y-10 sm:space-y-12 md:space-y-14">
        <div className="space-y-4">
          <VariantSelector variants={product.variants} />
          <PurchaseStatus />
        </div>

        {selectedSize ? (
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            disabled={!canAdd}
          />
        ) : null}

        <div className="space-y-4">
          <div ref={purchaseCtaRef}>
            <AddToCartButton
              disabled={!canAdd}
              onAdd={handleAddToCart}
              label={buttonLabel}
            />
          </div>
          <div aria-live="polite" className="min-h-[1.25rem]">
            {isAdded && selectedSize ? (
              <p className="text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400 md:text-[10px]">
                {copy.added(selectedSize, quantity > 1 ? quantity : undefined)}.{" "}
                <Link
                  href="/cart"
                  className="text-neutral-600 transition-opacity duration-300 hover:opacity-50"
                >
                  {copy.viewBag}
                </Link>
              </p>
            ) : null}
          </div>
          <ProductPurchaseReassurance />
        </div>
      </section>

      {includeTabs ? <ProductDetailTabs detail={detail} /> : null}
    </div>
  );
}
