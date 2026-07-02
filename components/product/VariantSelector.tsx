"use client";

import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { formatGraphpaperSizeLabel } from "@/lib/products/size-notation";
import { cn } from "@/lib/utils";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import type { ProductSize, ProductVariant } from "@/types";

type VariantSelectorProps = {
  variants: ProductVariant[];
};

const pdpCopy = GRAPHPAPER_STORE_COPY.pdp;

export function VariantSelector({ variants }: VariantSelectorProps) {
  const { selectedSize, setSelectedSize, recommendedSize } =
    useProductPurchase();

  const handleSelect = (size: ProductSize, inStock: boolean) => {
    if (!inStock) return;
    setSelectedSize(size);
  };

  if (variants.length === 0) {
    return (
      <p className="text-xs font-light text-neutral-600">
        No sizes available.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[11px] font-light tracking-[0.16em] text-neutral-600">
          {pdpCopy.color}
        </p>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-4 w-4 rounded-full border border-neutral-300 bg-white"
          />
          <span className="text-[12px] font-light tracking-[0.06em] text-neutral-600">
            {pdpCopy.colorValue}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[11px] font-light tracking-[0.16em] text-neutral-600">
            Size
          </p>
          <a
            href="#size-guide"
            className="text-[11px] font-light tracking-[0.06em] text-neutral-600 underline-offset-4 transition-opacity hover:text-neutral-600 hover:underline"
          >
            Size guide
          </a>
        </div>

        <ul className="flex flex-wrap gap-x-1 gap-y-2" role="list">
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
                  aria-pressed={isSelected}
                  aria-label={`Size ${formatGraphpaperSizeLabel(variant.size)}${!inStock ? ", out of stock" : ""}`}
                  className={cn(
                    "relative flex min-h-10 min-w-10 items-center justify-center px-2 text-[12px] font-light tracking-[0.04em] transition-opacity duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-neutral-400",
                    !inStock &&
                      "cursor-not-allowed text-neutral-400 line-through",
                    inStock && isSelected && "text-neutral-900 opacity-100",
                    inStock &&
                      !isSelected &&
                      isRecommended &&
                      "text-neutral-700 opacity-100 ring-1 ring-neutral-300/60",
                    inStock &&
                      !isSelected &&
                      !isRecommended &&
                      "text-neutral-600 opacity-80 hover:opacity-100",
                  )}
                >
                  {formatGraphpaperSizeLabel(variant.size)}
                  {isSelected && inStock ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-1 bottom-1 h-px bg-neutral-900"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
