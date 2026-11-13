"use client";

import { Link } from "@/components/i18n/Link";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { SizeRecommendationTool } from "@/components/product/SizeRecommendationTool";
import { RestockForm } from "@/components/restock/RestockForm";
import { SaveInlineButton } from "@/components/saved/SaveButton";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { PRODUCT_SIZES } from "@/lib/products/defaults";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getProductCopy } from "@/lib/copy/site-ui";
import { cmToInches } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";

/** Size buttons + add-to-cart — client-only purchase UI. */
export function ProductPurchaseControls() {
  const locale = useLocale();
  const copy = getProductCopy(locale);
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
  const selectedMeasurement = selectedSize
    ? product.sizeGuide.find((row) => row.size === selectedSize)
    : undefined;
  const [, lengthLabel, shoulderLabel, chestLabel, sleeveLabel] =
    copy.sizeTableHeaders;
  // Out of stock is handled by the restock form, so "disabled" here only
  // means every unit in stock is already in the bag.
  const showRestock = selectedSize !== null && isOutOfStock;
  const trulyDisabled = Boolean(selectedSize) && maxQuantity < 1;

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
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={isSelected}
                  aria-label={copy.sizeAria(size, inStock)}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center border border-[var(--color-ink)] px-3 text-[14px] font-normal tracking-[0.04em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                    // Still selectable: choosing it offers the restock notice.
                    !inStock &&
                      !isSelected &&
                      "border-[var(--color-hairline)] text-[var(--color-ink-faint)] line-through hover:border-[var(--color-ink)]",
                    !inStock &&
                      isSelected &&
                      "bg-[var(--color-ink)] text-[var(--color-bg)] line-through",
                    inStock &&
                      isSelected &&
                      "bg-[var(--color-ink)] text-[var(--color-bg)]",
                    inStock &&
                      !isSelected &&
                      "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]",
                  )}
                >
                  {size}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Selected size measurements — answers "how big is it?" in place */}
        <p
          aria-live="polite"
          className="type-caption mt-3 min-h-[1.8em] tabular-nums"
        >
          {selectedMeasurement ? (
            <>
              <span className="text-[var(--color-ink)]">
                {selectedMeasurement.size}
              </span>
              <span aria-hidden className="mx-2 text-[var(--color-ink-faint)]">
                —
              </span>
              {lengthLabel} {selectedMeasurement.length}
              <span aria-hidden className="mx-1.5 text-[var(--color-ink-faint)]">
                /
              </span>
              {shoulderLabel} {selectedMeasurement.shoulder}
              <span aria-hidden className="mx-1.5 text-[var(--color-ink-faint)]">
                /
              </span>
              {chestLabel} {selectedMeasurement.chest}
              <span aria-hidden className="mx-1.5 text-[var(--color-ink-faint)]">
                /
              </span>
              {sleeveLabel} {selectedMeasurement.sleeve}
              <span className="ml-1 text-[var(--color-ink-faint)]">cm</span>
              {locale === "en" ? (
                <span className="block text-[var(--color-ink-faint)]">
                  {cmToInches(selectedMeasurement.length)} /{" "}
                  {cmToInches(selectedMeasurement.shoulder)} /{" "}
                  {cmToInches(selectedMeasurement.chest)} /{" "}
                  {cmToInches(selectedMeasurement.sleeve)} in
                </span>
              ) : null}
            </>
          ) : null}
        </p>

        <SizeRecommendationTool
          fitProfile={product.fitProfile}
          availableSizes={sizes}
          collapsible
        />

        <Link
          href={`/concierge?from=${product.slug}`}
          className="mt-4 flex min-h-11 items-center justify-between gap-4 border border-[var(--color-navy)] px-4 text-[13px] tracking-[0.04em] text-[var(--color-navy)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-navy)] hover:text-white"
        >
          {copy.askConcierge}
          <span aria-hidden className="font-en">
            →
          </span>
        </Link>

        <Link
          href="#size-guide"
          className="mt-2 inline-flex min-h-11 items-center text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)] underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
        >
          {copy.sizeGuide}
        </Link>
      </div>

      <div ref={purchaseCtaRef} className="space-y-3">
        {showRestock ? (
          <RestockForm
            key={`${product.id}-${selectedSize}`}
            productId={product.id}
            size={selectedSize}
          />
        ) : (
          <button
            type="button"
            onClick={onCartClick}
            disabled={trulyDisabled}
            aria-disabled={noSizeSelected || trulyDisabled}
            className={cn(
              "flex h-14 w-full items-center justify-center text-[14px] font-normal tracking-[0.1em] text-[var(--color-bg)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
              trulyDisabled
                ? "cursor-not-allowed bg-[var(--color-ink-faint)]"
                : "bg-[var(--color-ink)] hover:opacity-80",
            )}
          >
            {noSizeSelected ? copy.selectSize : buttonLabel}
          </button>
        )}

        <SaveInlineButton
          productId={product.id}
          productName={getGraphpaperDisplayName(product)}
          size={selectedSize}
        />

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
