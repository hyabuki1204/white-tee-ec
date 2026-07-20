"use client";

import Link from "next/link";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { PRODUCT_SIZES } from "@/lib/products/defaults";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";

const { product: copy } = SITE_UI_COPY;

/** Size buttons + add-to-cart — client-only purchase UI. */
export function ProductPurchaseControls() {
  const {
    product,
    selectedSize,
    setSelectedSize,
    canAdd,
    isOutOfStock,
    maxQuantity,
    addError,
    buttonLabel,
    handleAddToCart,
    purchaseCtaRef,
  } = useProductPurchase();

  const sizeMap = new Map(
    product.variants.map((variant) => [variant.size, variant]),
  );

  const sizes: ProductSize[] =
    product.variants.length > 0
      ? PRODUCT_SIZES.filter((size) => sizeMap.has(size))
      : [...PRODUCT_SIZES];

  const noSizeSelected = selectedSize === null;
  const trulyDisabled =
    Boolean(selectedSize) && (isOutOfStock || maxQuantity < 1);

  const onCartClick = () => {
    if (noSizeSelected) {
      handleAddToCart();
      return;
    }
    if (!canAdd) return;
    handleAddToCart();
  };

  return (
    <div className="mt-8 space-y-6">
      <div>
        <p className="mb-3 text-[11px] font-normal tracking-[0.12em] text-[var(--color-ink-soft)]">
          {copy.size}
        </p>
        <ul className="flex flex-wrap gap-2" role="list">
          {sizes.map((size) => {
            const variant = sizeMap.get(size);
            const inStock = variant ? variant.stockQuantity > 0 : true;
            const isSelected = selectedSize === size;

            return (
              <li key={size}>
                <button
                  type="button"
                  onClick={() => {
                    if (!inStock) return;
                    setSelectedSize(size);
                  }}
                  disabled={!inStock}
                  aria-pressed={isSelected}
                  aria-label={`Size ${size}${!inStock ? ", out of stock" : ""}`}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center border border-[var(--color-ink)] px-3 text-[14px] font-normal tracking-[0.04em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                    !inStock &&
                      "cursor-not-allowed border-[var(--color-hairline)] text-[var(--color-ink-faint)] line-through",
                    inStock &&
                      isSelected &&
                      "bg-[var(--color-ink)] text-white",
                    inStock &&
                      !isSelected &&
                      "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white",
                  )}
                >
                  {size}
                </button>
              </li>
            );
          })}
        </ul>

        <Link
          href="#size-guide"
          className="mt-4 inline-flex min-h-11 items-center text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)] underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
        >
          {copy.sizeGuide}
        </Link>
      </div>

      <div ref={purchaseCtaRef} className="space-y-3">
        <button
          type="button"
          onClick={onCartClick}
          disabled={trulyDisabled}
          aria-disabled={noSizeSelected || trulyDisabled}
          className={cn(
            "flex h-14 w-full items-center justify-center text-[14px] font-normal tracking-[0.1em] text-white transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
            trulyDisabled
              ? "cursor-not-allowed bg-[var(--color-ink-faint)]"
              : noSizeSelected
                ? "cursor-pointer bg-[var(--color-ink)] opacity-50"
                : "bg-[var(--color-ink)] hover:opacity-80",
          )}
        >
          {buttonLabel}
        </button>

        <div aria-live="polite" className="min-h-[1.25rem]">
          {addError ? (
            <p className="text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)]">
              {addError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
