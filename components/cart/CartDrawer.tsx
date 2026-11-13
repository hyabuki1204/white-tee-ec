"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartCheckoutButton } from "@/components/cart/CartCheckoutButton";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { CartItem } from "@/components/cart/CartItem";
import { CartOrderNotes } from "@/components/cart/CartOrderNotes";
import { CartSummary } from "@/components/cart/CartSummary";
import type { CartProductLookup } from "@/components/cart/CartPageContent";
import { useCheckout } from "@/lib/cart/use-checkout";
import { useCartReconcile } from "@/lib/cart/use-cart-reconcile";
import type { CartStockLookup } from "@/lib/cart/stock-validation";
import { getFabricCrossSellProducts } from "@/lib/products/cross-sell";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  textLinkClass,
} from "@/lib/store-ui/ui-classes";
import { formatPrice } from "@/lib/utils/format-price";
import { useCartStore } from "@/lib/cart/store";
import type { ProductSize } from "@/types";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const storeCopy = getStoreCopy(useLocale());
  const copy = storeCopy.cart;
  const { isOpen, closeDrawer, products, fabricNameBySlug } = useCartDrawer();
  const items = useCartStore((state) => state.items);
  const [orderNotes, setOrderNotes] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Modal behaviour: move focus in, trap Tab, close on Escape, and return
  // focus to whatever opened the drawer.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [closeDrawer, isOpen]);

  const productLookup = useMemo<CartProductLookup>(() => {
    const lookup: CartProductLookup = {};

    for (const product of products) {
      const fabricName = product.fabricSlug
        ? fabricNameBySlug[product.fabricSlug]
        : null;

      lookup[product.id] = {
        id: product.id,
        slug: product.slug,
        name: getGraphpaperDisplayName(product, fabricName),
        price: product.price,
        imageUrl: product.imageUrl,
        variants: Object.fromEntries(
          product.variants.map((variant) => [
            variant.size,
            { stockQuantity: variant.stockQuantity },
          ]),
        ),
      };
    }

    return lookup;
  }, [fabricNameBySlug, products]);

  const stockLookup = useMemo<CartStockLookup>(() => {
    const lookup: CartStockLookup = {};

    for (const [id, product] of Object.entries(productLookup)) {
      lookup[id] = {
        name: product.name,
        variants: product.variants,
      };
    }

    return lookup;
  }, [productLookup]);

  const reconcileNotice = useCartReconcile(stockLookup, isOpen);

  const crossSellProducts = getFabricCrossSellProducts(
    items.map((item) => item.productId),
    products,
  );

  const getMaxQuantity = (productId: string, variant: string) =>
    Math.max(
      productLookup[productId]?.variants[variant as ProductSize]
        ?.stockQuantity ?? 0,
      0,
    );

  const hasUnavailableItems = items.some(
    (item) =>
      !productLookup[item.productId] ||
      getMaxQuantity(item.productId, item.variant) < 1,
  );

  const checkout = useCheckout({ hasUnavailableItems, orderNotes });
  const pieceCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-[var(--color-mill)]/40 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex h-[100dvh] max-h-[100dvh] w-full max-w-[30rem] flex-col border-l border-[var(--color-hairline)] bg-[var(--color-ground)] transition-transform duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-end justify-between border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-6 pb-5 pt-6">
          <div>
            <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
            <h2
              id="cart-drawer-title"
              className="mt-1 flex items-baseline gap-3 text-[20px] font-bold tracking-[0.1em] text-[var(--color-ink)]"
            >
              {copy.title}
              {pieceCount > 0 ? (
                <span className="type-label font-normal tabular-nums">
                  {pieceCount} {pieceCount === 1 ? "piece" : "pieces"}
                </span>
              ) : null}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            className="type-label -mr-2 inline-flex min-h-11 items-center px-2 text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
          >
            {storeCopy.search.close}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6">
          {items.length === 0 ? (
            <div className="py-10">
              <p className="type-h2">{copy.empty}</p>
              <p className="type-body mt-3 text-[var(--color-ink-soft)]">
                {copy.emptyLead}
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className={buttonPrimaryClass}
                >
                  {copy.viewAll}
                </Link>
                <Link
                  href="/fabric"
                  onClick={closeDrawer}
                  className={buttonSecondaryClass}
                >
                  {copy.exploreFabric}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {reconcileNotice ? (
                <p role="status" className="type-body pt-5 text-red-700">
                  {reconcileNotice}
                </p>
              ) : null}

              <ul className="divide-y divide-[var(--color-hairline)]">
                {items.map((item) => {
                  const product = productLookup[item.productId];
                  const maxQuantity = getMaxQuantity(
                    item.productId,
                    item.variant,
                  );

                  return (
                    <li key={`${item.productId}-${item.variant}`}>
                      <CartItem
                        item={item}
                        productName={product?.name ?? "Unknown Product"}
                        productSlug={product?.slug}
                        imageUrl={product?.imageUrl}
                        currentPrice={product?.price ?? item.price}
                        maxQuantity={maxQuantity}
                        isUnavailable={!product || maxQuantity < 1}
                        onNavigate={closeDrawer}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-[var(--color-hairline)] py-6">
                <CartSummary
                  hasUnavailableItems={hasUnavailableItems}
                  orderNotes={orderNotes}
                  showCheckout={false}
                  showTrust={false}
                />
              </div>

              <CartOrderNotes
                value={orderNotes}
                onChange={setOrderNotes}
                className="border-t border-[var(--color-hairline)] py-6"
              />

              {crossSellProducts.length > 0 ? (
                <section className="border-t border-[var(--color-hairline)] py-6">
                  <p className="type-caption !text-[var(--color-ink)]">
                    {copy.pairWith}
                  </p>
                  <ul className="mt-4 grid grid-cols-2 gap-4">
                    {crossSellProducts.slice(0, 2).map((product) => {
                      const fabricName = product.fabricSlug
                        ? fabricNameBySlug[product.fabricSlug]
                        : null;
                      const displayName = getGraphpaperDisplayName(
                        product,
                        fabricName,
                      );

                      return (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeDrawer}
                            className="group block"
                          >
                            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-placeholder)]">
                              <Image
                                src={product.imageUrl}
                                alt=""
                                fill
                                sizes="220px"
                                className="object-cover transition-opacity duration-[var(--duration-fast)] group-hover:opacity-80"
                              />
                            </div>
                            <p className="mt-3 font-en text-[15px] leading-snug tracking-[0.02em] text-[var(--color-ink)]">
                              {displayName}
                            </p>
                            <p className="mt-1 font-en text-[13px] tabular-nums text-[var(--color-ink-soft)]">
                              {formatPrice(product.price)}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>

        {items.length > 0 ? (
          <div className="shrink-0 border-t border-[var(--color-hairline)] bg-[var(--color-surface)] px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {checkout.error ? (
              <p role="alert" className="type-caption mb-3 !text-red-700">
                {checkout.error}
              </p>
            ) : null}
            <CartCheckoutButton
              label={
                <>
                  {copy.checkout}
                  <span className="ml-4 font-en text-[16px] tracking-[0.02em] tabular-nums">
                    {checkout.formatPrice(checkout.total)}
                  </span>
                </>
              }
              loadingLabel={copy.processing}
              disabled={checkout.checkoutDisabled}
              isLoading={checkout.isLoading}
              onClick={checkout.handleCheckout}
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={closeDrawer}
                className={`${textLinkClass} min-h-11 !text-[12px]`}
              >
                {copy.continueShopping}
              </button>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className={`${textLinkClass} inline-flex min-h-11 items-center !text-[12px]`}
              >
                {copy.viewCart}
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
