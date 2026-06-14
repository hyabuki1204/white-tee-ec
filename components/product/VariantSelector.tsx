"use client";

import { useState } from "react";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";
import type { ProductSize, ProductVariant } from "@/types";

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedSize: ProductSize | null;
  onSelect: (size: ProductSize) => void;
};

export function VariantSelector({
  variants,
  selectedSize,
  onSelect,
}: VariantSelectorProps) {
  const [flashSize, setFlashSize] = useState<ProductSize | null>(null);
  const { product: copy } = SITE_UI_COPY;

  const handleSelect = (size: ProductSize, inStock: boolean) => {
    if (!inStock) return;

    onSelect(size);
    setFlashSize(size);
    window.setTimeout(() => setFlashSize(null), 180);
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
        {selectedSize ? (
          <p className="text-[11px] font-light tracking-[0.05em] text-neutral-600 md:text-[10px] md:text-neutral-500">
            {copy.sizeSelected(selectedSize)}
          </p>
        ) : null}
      </div>
      <ul className="-mx-1 flex flex-wrap gap-x-1 gap-y-2">
        {variants.map((variant) => {
          const isSelected = selectedSize === variant.size;
          const isFlashing = flashSize === variant.size;
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
                  inStock && isFlashing && "opacity-40",
                  inStock &&
                    !isFlashing &&
                    isSelected &&
                    "text-neutral-900 opacity-100",
                  inStock &&
                    !isFlashing &&
                    !isSelected &&
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
