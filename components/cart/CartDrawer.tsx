"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import type { CartProductLookup } from "@/components/cart/CartPageContent";
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
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
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

  return (
    <>
      <button
        type="button"
        aria-label="Close bag"
        className={cn(
          "fixed inset-0 z-[60] bg-neutral-900/25 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
      />

      <aside
        aria-label={copy.title}
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-background shadow-[-8px_0_32px_rgba(0,0,0,0.06)] transition-transform duration-400 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200/70 px-6 py-5">
          <p className="text-[11px] font-light tracking-[0.2em] text-neutral-800">
            {copy.title}
          </p>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center text-neutral-500 transition-opacity hover:opacity-60"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] font-light tracking-wide text-neutral-500">
                {copy.empty}
              </p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="mt-8 inline-flex min-h-11 items-center text-[12px] font-light tracking-[0.12em] text-neutral-800 transition-opacity hover:opacity-60"
              >
                {copy.viewAll}
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-neutral-200/70">{itemElements}</ul>

              {crossSellProducts.length > 0 ? (
                <section className="mt-10 border-t border-neutral-200/60 pt-8">
                  <p className="mb-6 text-[10px] font-light tracking-[0.14em] text-neutral-400">
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
                              className="object-cover transition-opacity duration-300 group-hover:opacity-70"
                            />
                          </div>
                          <div className="min-w-0 pt-1">
                            <p className="text-[10px] tracking-[0.08em] text-neutral-400">
                              {GRAPHPAPER_STORE_COPY.brandLine}
                            </p>
                            <p className="mt-1 text-[11px] font-light tracking-[0.04em] text-neutral-800">
                              {displayName}
                            </p>
                            <p className="mt-1 text-[10px] font-light tracking-[0.06em] text-neutral-400">
                              {FIT_TYPE_LABELS[product.fitType]}
                            </p>
                            <p className="mt-2 text-[11px] text-neutral-500">
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

              <label className="mt-10 block">
                <span className="text-[10px] font-light tracking-[0.12em] text-neutral-400">
                  {copy.orderNotes}
                </span>
                <textarea
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder={copy.orderNotesPlaceholder}
                  rows={3}
                  className="mt-3 w-full resize-none border border-neutral-200/80 bg-transparent px-3 py-3 text-[12px] font-light text-neutral-700 outline-none transition-colors focus:border-neutral-400"
                />
              </label>
            </>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-neutral-200/70 px-6 py-6">
            <CartSummary
              hasUnavailableItems={hasUnavailableItems}
              orderNotes={orderNotes}
              prominentCheckout
              showContinueShopping
              onContinueShopping={closeDrawer}
            />
          </div>
        ) : null}
      </aside>
    </>
  );
}
