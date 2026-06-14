"use client";

import { useState } from "react";
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
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[10px] font-light tracking-[0.16em] text-neutral-400">
          Size
        </p>
        {selectedSize ? (
          <p className="text-[10px] font-light tracking-[0.06em] text-neutral-500">
            {selectedSize} selected
          </p>
        ) : null}
      </div>
      <ul className="flex flex-wrap gap-x-7 gap-y-1">
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
                  "relative pb-2 text-xs font-light tracking-wide transition-opacity duration-300",
                  !inStock && "cursor-not-allowed text-neutral-300 line-through",
                  inStock && isFlashing && "opacity-40",
                  inStock &&
                    !isFlashing &&
                    isSelected &&
                    "text-neutral-900 opacity-100",
                  inStock &&
                    !isFlashing &&
                    !isSelected &&
                    "text-neutral-400 opacity-60 hover:opacity-80",
                )}
                aria-pressed={isSelected}
                aria-disabled={!inStock}
              >
                {variant.size}
                {isSelected && inStock ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-neutral-900"
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
