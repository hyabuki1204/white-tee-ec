"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RestockForm } from "@/components/restock/RestockForm";
import { getInCartQuantity } from "@/lib/cart/stock-validation";
import { useCartStore } from "@/lib/cart/store";
import { SAVED_COPY } from "@/lib/saved/copy";
import {
  useSavedStore,
  type SavedCatalogEntry,
  type SavedItem,
} from "@/lib/saved/store";
import { useHydrated } from "@/lib/saved/use-hydrated";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";

/** Server-prepared slice of a published product: current price and stock. */
export type SavedProductView = {
  id: string;
  slug: string;
  /** Gauge-first name. */
  name: string;
  caption: string | null;
  price: number;
  imageUrl: string;
  variants: { size: ProductSize; stockQuantity: number }[];
};

type SavedPageContentProps = {
  products: SavedProductView[];
};

const { page: copy } = SAVED_COPY;
const ADDED_LABEL_MS = 1500;

const sizeCellClass =
  "flex min-h-11 w-full items-center justify-center border px-3 font-en text-[14px] tracking-[0.04em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]";

export function SavedPageContent({ products }: SavedPageContentProps) {
  const hydrated = useHydrated();
  const items = useSavedStore((state) => state.items);
  const droppedCount = useSavedStore((state) => state.droppedCount);
  const reconcile = useSavedStore((state) => state.reconcile);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  // Bring the stored list in line with the live catalog: drop pieces that
  // are no longer published, clear sizes that are no longer offered.
  useEffect(() => {
    const catalog: Record<string, SavedCatalogEntry> = {};

    for (const product of products) {
      catalog[product.id] = {
        sizes: product.variants.map((variant) => variant.size),
      };
    }

    reconcile(catalog);
  }, [products, reconcile]);

  // localStorage is unknown until hydration; hold the space, show nothing.
  if (!hydrated) {
    return <div aria-busy className="min-h-[40vh]" />;
  }

  const rows = items.flatMap((item) => {
    const product = productById.get(item.productId);
    return product ? [{ item, product }] : [];
  });

  return (
    <>
      {droppedCount > 0 ? (
        <p role="status" className="type-caption mb-8">
          {copy.dropped(droppedCount)}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="py-10 md:py-16">
          <h2 className="type-h2">{copy.emptyTitle}</h2>
          <p className="type-body mt-4 text-[var(--color-ink-soft)]">
            {copy.emptyBody}
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[var(--color-navy)] px-10 text-[13px] tracking-[0.1em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-ink)]"
          >
            {copy.emptyLink}
          </Link>
        </div>
      ) : (
        <>
          <p className="type-label tabular-nums">{copy.count(rows.length)}</p>
          <ul className="mt-6 border-t border-[var(--color-hairline)]">
            {rows.map(({ item, product }) => (
              <SavedRow key={item.productId} item={item} product={product} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

type SavedRowProps = {
  item: SavedItem;
  product: SavedProductView;
};

function SavedRow({ item, product }: SavedRowProps) {
  const setSize = useSavedStore((state) => state.setSize);
  const remove = useSavedStore((state) => state.remove);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const [needsSize, setNeedsSize] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const size = item.size;
  const variant = size
    ? product.variants.find((entry) => entry.size === size)
    : undefined;
  const stock = variant?.stockQuantity ?? 0;
  const inCart = size ? getInCartQuantity(cartItems, product.id, size) : 0;
  const available = Math.max(0, stock - inCart);
  const outOfStock = size !== null && stock < 1;
  const allInBag = size !== null && stock > 0 && available < 1;
  const href = `/products/${product.slug}${size ? `?size=${size}` : ""}`;

  const status =
    size === null
      ? needsSize
        ? copy.chooseSize
        : null
      : outOfStock
        ? copy.outOfStock
        : allInBag
          ? copy.allInBag
          : stock <= 5
            ? copy.lowStock(stock)
            : copy.inStock;

  const onAdd = () => {
    if (size === null) {
      setNeedsSize(true);
      return;
    }
    if (available < 1) return;

    addItem({
      productId: product.id,
      variant: size,
      price: product.price,
      quantity: 1,
    });

    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => {
      setAdded(false);
      addedTimer.current = null;
    }, ADDED_LABEL_MS);
  };

  return (
    <li className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-5 gap-y-6 border-b border-[var(--color-hairline)] py-8 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,360px)] md:gap-x-10 md:py-10">
      <Link
        href={href}
        className="relative block aspect-[3/4] self-start overflow-hidden bg-[var(--color-image-placeholder)]"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="140px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="min-w-0">
        <Link
          href={href}
          className="font-en text-[17px] leading-snug tracking-[0.02em] text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60 md:text-[20px]"
        >
          {product.name}
        </Link>
        {product.caption ? (
          <p className="type-caption mt-1">{product.caption}</p>
        ) : null}
        <p className="mt-3 flex items-baseline gap-2 text-[var(--color-ink)]">
          <span className="font-en text-[15px] tabular-nums tracking-[0.04em]">
            {formatPrice(product.price)}
          </span>
          <span className="type-fine">{copy.taxIncluded}</span>
        </p>
      </div>

      <div className="col-span-2 md:col-span-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="type-caption">{copy.size}</p>
          <p
            aria-live="polite"
            className={cn(
              "type-caption text-right",
              (outOfStock || needsSize) && "text-[var(--color-ink)]",
            )}
          >
            {status}
          </p>
        </div>
        <ul className="mt-2 flex gap-2" role="list">
          {product.variants.map((entry) => {
            const selected = entry.size === size;
            const inStock = entry.stockQuantity > 0;

            return (
              <li key={entry.size} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setSize(product.id, entry.size);
                    setNeedsSize(false);
                    setAdded(false);
                  }}
                  aria-pressed={selected}
                  aria-label={`Size ${entry.size}${inStock ? "" : ", out of stock"}`}
                  className={cn(
                    sizeCellClass,
                    selected
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                      : "border-[var(--color-hairline)] hover:border-[var(--color-ink)]",
                    !selected &&
                      (inStock
                        ? "text-[var(--color-ink)]"
                        : "text-[var(--color-ink-faint)]"),
                    !inStock && "line-through",
                  )}
                >
                  {entry.size}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          {size !== null && outOfStock ? (
            <RestockForm
              key={`${product.id}-${size}`}
              productId={product.id}
              size={size}
              hideHeading
            />
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={allInBag}
              className={cn(
                "flex h-12 w-full items-center justify-center text-[13px] tracking-[0.1em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                allInBag
                  ? "cursor-not-allowed bg-[var(--color-ink-faint)]"
                  : "bg-[var(--color-navy)] hover:bg-[var(--color-ink)]",
              )}
            >
              {added ? copy.added : copy.addToBag}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => remove(product.id)}
          aria-label={copy.removeAria(product.name)}
          className="type-caption mt-2 inline-flex min-h-11 items-center underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
        >
          {copy.remove}
        </button>
      </div>
    </li>
  );
}
