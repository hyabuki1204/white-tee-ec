"use client";

import { Link } from "@/components/i18n/Link";
import { useMemo, useState } from "react";
import { CartFabricCrossSell } from "@/components/cart/CartFabricCrossSell";
import { CartItem } from "@/components/cart/CartItem";
import { CartOrderNotes } from "@/components/cart/CartOrderNotes";
import { CartStickyCheckout } from "@/components/cart/CartStickyCheckout";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartReconcile } from "@/lib/cart/use-cart-reconcile";
import type { CartStockLookup } from "@/lib/cart/stock-validation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getGaugeLadder } from "@/lib/fabric/gauge";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  textLinkClass,
} from "@/lib/store-ui/ui-classes";
import { getFabricCrossSellProducts } from "@/lib/products/cross-sell";
import { useCartStore } from "@/lib/cart/store";
import type { Product } from "@/types";
import type { ProductSize } from "@/types";

export type CartVariantLookup = Record<
  ProductSize,
  { stockQuantity: number }
>;

export type CartProductLookup = Record<
  string,
  {
    id: string;
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
    variants: Partial<CartVariantLookup>;
  }
>;

type CartPageContentProps = {
  productLookup: CartProductLookup;
  allProducts: Product[];
  fabricNameBySlug: Record<string, string>;
};

function CartEmpty() {
  const locale = useLocale();
  const { cart: copy } = getStoreCopy(locale);

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-0">
      <div className="md:col-span-6">
        <h2 className="type-h2">{copy.empty}</h2>
        <p className="type-body mt-4 text-[var(--color-ink-soft)]">
          {copy.emptyLead}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className={buttonPrimaryClass}>
            {copy.viewAll}
          </Link>
          <Link href="/fabric" className={buttonSecondaryClass}>
            {copy.exploreFabric}
          </Link>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-4 md:col-span-5 md:col-start-8">
        {getGaugeLadder(locale).map((spec) => (
          <li key={spec.fabricSlug}>
            <Link
              href={`/fabric/${spec.fabricSlug}`}
              className="group block border-t border-[var(--color-ink)] pt-4"
            >
              <span className="block font-en text-[clamp(32px,5vw,56px)] font-light leading-none tracking-[-0.03em] tabular-nums text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] group-hover:text-[var(--color-navy)]">
                {spec.gauge}
                <span className="ml-0.5 text-[0.4em] tracking-normal">G</span>
              </span>
              <span className="type-caption mt-3 block">{spec.headline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CartSkeleton() {
  const loading = getStoreCopy(useLocale()).states.loading;

  return (
    <div aria-busy="true" className="grid gap-10 lg:grid-cols-12 lg:gap-0">
      <div className="space-y-6 lg:col-span-7">
        {[0, 1].map((row) => (
          <div key={row} className="flex gap-5">
            <div className="skeleton-block aspect-[3/4] w-20 sm:w-24" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="skeleton-block h-4 w-1/2" />
              <div className="skeleton-block h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton-block h-64 lg:col-span-4 lg:col-start-9" />
      <span className="sr-only">{loading}</span>
    </div>
  );
}

export function CartPageContent({
  productLookup,
  allProducts,
  fabricNameBySlug,
}: CartPageContentProps) {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const [orderNotes, setOrderNotes] = useState("");
  const { cart: copy } = getStoreCopy(useLocale());

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

  const reconcileNotice = useCartReconcile(stockLookup, true);

  const crossSellProducts = getFabricCrossSellProducts(
    items.map((item) => item.productId),
    allProducts,
  );

  // The cart lives in localStorage; until it has been read, show neither
  // the empty state nor a stale list.
  if (!hydrated) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <>
        {reconcileNotice ? (
          <p role="status" className="type-body mb-8 text-red-700">
            {reconcileNotice}
          </p>
        ) : null}
        <CartEmpty />
      </>
    );
  }

  const hasUnavailableItems = items.some((item) => {
    const stock =
      productLookup[item.productId]?.variants[item.variant]?.stockQuantity ?? 0;
    return !productLookup[item.productId] || stock < 1;
  });
  const pieceCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="pb-24 lg:pb-0">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-0">
        <div className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-[var(--color-ink)] pb-3">
            <p className="type-label tabular-nums">
              {copy.pieces(pieceCount)}
            </p>
            <Link href="/products" className={`${textLinkClass} !text-[12px]`}>
              {copy.continueShopping}
            </Link>
          </div>

          {reconcileNotice ? (
            <p role="status" className="type-body mt-5 text-red-700">
              {reconcileNotice}
            </p>
          ) : null}

          <ul className="divide-y divide-[var(--color-hairline)] border-b border-[var(--color-hairline)]">
            {items.map((item) => {
              const product = productLookup[item.productId];
              const maxQuantity = Math.max(
                product?.variants[item.variant]?.stockQuantity ?? 0,
                0,
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
                  />
                </li>
              );
            })}
          </ul>

          <CartOrderNotes
            value={orderNotes}
            onChange={setOrderNotes}
            className="mt-8 max-w-xl"
          />
        </div>

        <aside
          aria-label={copy.summaryTitle}
          className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-height)+var(--space-3))] lg:col-span-4 lg:col-start-9"
        >
          <p className="type-label !text-[var(--color-navy)]">
            {copy.summaryLabel}
          </p>
          <h2 className="mt-2 text-[16px] font-bold tracking-[0.08em] text-[var(--color-ink)]">
            {copy.summaryTitle}
          </h2>
          <div className="mt-6">
            <CartSummary
              hasUnavailableItems={hasUnavailableItems}
              orderNotes={orderNotes}
              hideCheckoutOnMobile
            />
          </div>
        </aside>
      </div>

      <CartFabricCrossSell
        products={crossSellProducts}
        fabricNameBySlug={fabricNameBySlug}
        className="mt-[var(--space-6)] border-t border-[var(--color-hairline)] pt-[var(--space-5)]"
      />

      <CartStickyCheckout
        hasUnavailableItems={hasUnavailableItems}
        orderNotes={orderNotes}
      />
    </div>
  );
}
