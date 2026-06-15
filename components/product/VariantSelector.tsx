"use client";

import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import type { ProductSize, ProductVariant } from "@/types";

type VariantSelectorProps = {
  variants: ProductVariant[];
};

export function VariantSelector({ variants }: VariantSelectorProps) {
  const {
    selectedSize,
    setSelectedSize,
    recommendedSize,
    openSizeTab,
  } = useProductPurchase();
  const { product: copy } = SITE_UI_COPY;

  const handleSelect = (size: ProductSize, inStock: boolean) => {
    if (!inStock) return;
    setSelectedSize(size);
  };

  if (variants.length === 0) {
    return (
      <p className="text-xs font-light text-neutral-400">
        No sizes available.
      </p>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[11px] font-light tracking-[0.14em] text-neutral-500 md:text-[10px] md:tracking-[0.16em] md:text-neutral-400">
          {copy.size}
        </p>
        <div className="flex items-baseline gap-4">
          <button
            type="button"
            onClick={openSizeTab}
            className="text-[11px] font-light tracking-[0.06em] text-neutral-400 underline-offset-4 transition-opacity duration-300 hover:text-neutral-600 hover:underline md:text-[10px]"
          >
            {copy.sizeGuide}
          </button>
          {selectedSize ? (
            <p className="text-[11px] font-light tracking-[0.05em] text-neutral-600 md:text-[10px] md:text-neutral-500">
              {copy.sizeSelected(selectedSize)}
            </p>
          ) : null}
        </div>
      </div>
      <ul className="-mx-1 flex flex-wrap gap-x-1 gap-y-2">
        {variants.map((variant) => {
          const isSelected = selectedSize === variant.size;
          const isRecommended = recommendedSize === variant.size;
          const inStock = variant.stockQuantity > 0;

          return (
            <li key={variant.size}>
              <button
                type="button"
                onClick={() => handleSelect(variant.size, inStock)}
                disabled={!inStock}
                className={cn(
                  "relative flex min-h-11 min-w-11 items-center justify-center px-3 text-[13px] font-light tracking-wide transition-opacity duration-300 md:min-h-0 md:min-w-0 md:px-0 md:pb-2 md:text-xs",
                  !inStock && "cursor-not-allowed text-neutral-300 line-through",
                  inStock && isSelected && "text-neutral-900 opacity-100",
                  inStock &&
                    !isSelected &&
                    isRecommended &&
                    "text-neutral-700 opacity-100 ring-1 ring-neutral-300/60 md:ring-0 md:underline md:decoration-neutral-400 md:underline-offset-4",
                  inStock &&
                    !isSelected &&
                    !isRecommended &&
                    "text-neutral-500 opacity-80 active:opacity-100 md:text-neutral-400 md:opacity-60 md:hover:opacity-80",
                )}
                aria-pressed={isSelected}
                aria-disabled={!inStock}
              >
                {variant.size}
                {isSelected && inStock ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-2 hidden h-px bg-neutral-900 md:inset-x-0 md:bottom-0 md:block"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
