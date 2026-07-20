"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartCheckoutButton } from "@/components/cart/CartCheckoutButton";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import type { CartProductLookup } from "@/components/cart/CartPageContent";
import { useCheckout } from "@/lib/cart/use-checkout";
import { useCartReconcile } from "@/lib/cart/use-cart-reconcile";
import type { CartStockLookup } from "@/lib/cart/stock-validation";
import { getFabricCrossSellProducts } from "@/lib/products/cross-sell";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { FIT_TYPE_LABELS } from "@/lib/products/silhouette";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { formatPrice } from "@/lib/utils/format-price";
import { useCartStore } from "@/lib/cart/store";
import type { ProductSize } from "@/types";
import { cn } from "@/lib/utils";

const copy = GRAPHPAPER_STORE_COPY.cart;

export function CartDrawer() {
  const { isOpen, closeDrawer, products, fabricNameBySlug } = useCartDrawer();
  const items = useCartStore((state) => state.items);
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
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

  let hasUnavailableItems = false;

  const itemElements = items.map((item) => {
    const product = productLookup[item.productId];
    const variantStock =
      product?.variants[item.variant as ProductSize]?.stockQuantity ?? 0;
    const maxQuantity = Math.max(variantStock, 0);
    const isUnavailable = !product || maxQuantity < 1;

    if (isUnavailable) {
      hasUnavailableItems = true;
    }

    return (
      <li key={`${item.productId}-${item.variant}`}>
        <CartItem
          item={item}
          productName={product?.name ?? "Unknown Product"}
          productSlug={product?.slug}
          imageUrl={product?.imageUrl}
          currentPrice={product?.price ?? item.price}
          maxQuantity={maxQuantity}
          isUnavailable={isUnavailable}
        />
      </li>
    );
  });

  const checkout = useCheckout({ hasUnavailableItems, orderNotes });

  return (
    <>
      <button
        type="button"
        aria-label="Close bag"
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-[60] bg-neutral-900/25 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
      />

      <aside
        aria-label={copy.title}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col border-l border-[var(--color-hairline)] bg-background transition-transform duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/70 px-6 py-5">
          <div>
            <p className="text-[14px] font-normal tracking-[0.2em] text-neutral-900">
              {copy.title}
            </p>
            {items.length > 0 ? (
              <p className="mt-1 text-[12px] font-normal tracking-[0.06em] text-neutral-600">
                {copy.items} · {items.length}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center text-neutral-600 transition-opacity hover:opacity-60"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-4">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] font-normal tracking-wide text-neutral-600">
                {copy.empty}
              </p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="mt-8 inline-flex min-h-11 items-center text-[14px] font-normal tracking-[0.12em] text-neutral-800 transition-opacity hover:opacity-60"
              >
                {copy.viewAll}
              </Link>
            </div>
          ) : (
            <>
              {reconcileNotice ? (
                <p
                  role="status"
                  className="mb-6 text-[12px] font-normal leading-[1.8] tracking-[0.04em] text-red-600/90"
                >
                  {reconcileNotice}
                </p>
              ) : null}

              <ul className="divide-y divide-neutral-200/70">{itemElements}</ul>

              {crossSellProducts.length > 0 ? (
                <section className="mt-8 border-t border-neutral-200/60 pt-8">
                  <p className="mb-6 text-[11px] font-normal tracking-[0.14em] text-neutral-600">
                    {copy.pairWith}
                  </p>
                  <ul className="space-y-6">
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
                            className="group flex gap-4"
                          >
                            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-neutral-100">
                              <Image
                                src={product.imageUrl}
                                alt={displayName}
                                fill
                                sizes="80px"
                                className="object-cover transition-opacity duration-[var(--duration-fast)] group-hover:opacity-70"
                              />
                            </div>
                            <div className="min-w-0 pt-1">
                              <p className="text-[11px] tracking-[0.08em] text-neutral-600">
                                {GRAPHPAPER_STORE_COPY.brandLine}
                              </p>
                              <p className="mt-1 text-[12px] font-normal tracking-[0.04em] text-neutral-800">
                                {displayName}
                              </p>
                              <p className="mt-1 text-[11px] font-normal tracking-[0.06em] text-neutral-600">
                                {FIT_TYPE_LABELS[product.fitType]}
                              </p>
                              <p className="mt-2 text-[12px] text-neutral-600">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              <label className="mt-8 block">
                <span className="text-[11px] font-normal tracking-[0.12em] text-neutral-600">
                  {copy.orderNotes}
                </span>
                <textarea
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder={copy.orderNotesPlaceholder}
                  rows={3}
                  className="mt-3 w-full resize-none border border-neutral-200/80 bg-transparent px-3 py-3 text-[14px] font-normal text-neutral-700 outline-none transition-colors focus:border-neutral-400"
                />
              </label>

              <div className="mt-8 pb-4">
                <CartSummary
                  hasUnavailableItems={hasUnavailableItems}
                  orderNotes={orderNotes}
                  showCheckout={false}
                  showTopBorder
                />
              </div>
            </>
          )}
        </div>

        {items.length > 0 ? (
          <div className="shrink-0 border-t border-neutral-200/70 bg-background px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-[14px] tracking-wide text-neutral-600">
                {copy.total}
              </p>
              <p className="text-[14px] font-normal text-neutral-900">
                {checkout.formatPrice(checkout.total)}
              </p>
            </div>
            <p className="mb-4 text-[11px] font-normal text-neutral-500">
              {copy.taxIncluded}
            </p>
            {checkout.error ? (
              <p className="mb-3 text-[14px] font-normal text-red-600">
                {checkout.error}
              </p>
            ) : null}
            <CartCheckoutButton
              label={copy.checkout}
              loadingLabel={copy.processing}
              disabled={checkout.checkoutDisabled}
              isLoading={checkout.isLoading}
              onClick={checkout.handleCheckout}
              prominent
            />
            <button
              type="button"
              onClick={closeDrawer}
              className="mt-3 w-full py-2 text-[12px] font-normal tracking-[0.1em] text-neutral-600 transition-opacity hover:opacity-60"
            >
              {copy.continueShopping}
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
