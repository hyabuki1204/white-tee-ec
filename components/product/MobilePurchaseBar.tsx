"use client";

import { useEffect, useState } from "react";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { RestockForm } from "@/components/restock/RestockForm";
import { ApproxPrice } from "@/components/currency/ApproxPrice";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getProductCopy } from "@/lib/copy/site-ui";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";

type MobilePurchaseBarProps = {
  displayName: string;
};

/**
 * Quiet fixed purchase bar for mobile PDP.
 * Appears only while the inline add-to-cart button and the footer are off-screen.
 */
export function MobilePurchaseBar({ displayName }: MobilePurchaseBarProps) {
  const {
    product,
    selectedSize,
    buttonLabel,
    canAdd,
    isOutOfStock,
    handleAddToCart,
    purchaseCtaRef,
  } = useProductPurchase();
  const copy = getProductCopy(useLocale());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cta = purchaseCtaRef.current;
    if (!cta) return;

    const footer = document.querySelector("footer");
    let ctaInView = true;
    let footerInView = false;

    // Hide while the inline CTA is on screen, and near the footer so the
    // bar never covers the last links.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === cta) ctaInView = entry.isIntersecting;
          else footerInView = entry.isIntersecting;
        }
        setVisible(!ctaInView && !footerInView);
      },
      { threshold: 0.15 },
    );

    observer.observe(cta);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, [purchaseCtaRef]);

  const noSizeSelected = selectedSize === null;

  const onClick = () => {
    if (noSizeSelected) {
      // Bring the size selector into view; inline error explains why.
      handleAddToCart();
      purchaseCtaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    if (!canAdd) return;
    handleAddToCart();
  };

  return (
    <div
      role="region"
      aria-label="Quick purchase"
      inert={!visible ? true : undefined}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-hairline)] bg-[var(--color-bg)] px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-[var(--duration-fast)] ease-[var(--ease-quiet)] lg:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      {selectedSize && isOutOfStock ? (
        <RestockForm
          key={`${product.id}-${selectedSize}`}
          productId={product.id}
          size={selectedSize}
          compact
          className="mx-auto max-w-lg"
        />
      ) : (
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="type-body truncate text-[var(--color-ink)]">
              {displayName}
            </p>
            <p className="type-caption font-en tabular-nums tracking-[0.04em]">
              {formatPrice(product.price)}
              <ApproxPrice amount={product.price} className="ml-1.5" />
              {selectedSize ? (
                <span className="text-[var(--color-ink-soft)]">
                  <span aria-hidden className="mx-2 text-[var(--color-ink-faint)]">
                    /
                  </span>
                  {selectedSize}
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClick}
            disabled={!noSizeSelected && !canAdd}
            className={cn(
              "flex h-11 shrink-0 items-center justify-center px-5 text-[12px] font-normal tracking-[0.1em] text-[var(--color-bg)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
              !noSizeSelected && !canAdd
                ? "cursor-not-allowed bg-[var(--color-ink-faint)]"
                : "bg-[var(--color-ink)] hover:opacity-80",
            )}
          >
            {noSizeSelected ? copy.selectSizeButton : buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
