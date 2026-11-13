"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatPrice } from "@/lib/utils/format-price";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { useCartStore } from "@/lib/cart/store";
import type { CartLineItem } from "@/types/cart";

type CartItemProps = {
  item: CartLineItem;
  productName: string;
  productSlug?: string;
  imageUrl?: string;
  currentPrice: number;
  maxQuantity: number;
  isUnavailable: boolean;
  /** Called after following the product link (the drawer closes itself). */
  onNavigate?: () => void;
};

function QtyButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center font-en text-[16px] text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] hover:bg-[var(--color-ink)] hover:text-white disabled:cursor-not-allowed disabled:text-[var(--color-ink-faint)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-ink-faint)]"
    >
      {children}
    </button>
  );
}

const nameClass =
  "font-en text-[17px] leading-snug tracking-[0.02em] text-[var(--color-ink)]";

export function CartItem({
  item,
  productName,
  productSlug,
  imageUrl,
  currentPrice,
  maxQuantity,
  isUnavailable,
  onNavigate,
}: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { cart: copy } = GRAPHPAPER_STORE_COPY;

  const lineTotal = currentPrice * item.quantity;
  const priceChanged = currentPrice !== item.price;
  const atMax = item.quantity >= maxQuantity && maxQuantity > 0;

  return (
    <article className="flex gap-5 py-6">
      <div className="relative aspect-[3/4] w-20 shrink-0 self-start overflow-hidden bg-[var(--color-image-placeholder)] sm:w-24">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover object-center"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-4">
          {productSlug ? (
            <Link
              href={`/products/${productSlug}`}
              onClick={onNavigate}
              className={`${nameClass} transition-colors duration-[var(--duration-quiet)] hover:text-[var(--color-navy)]`}
            >
              {productName}
            </Link>
          ) : (
            <h3 className={nameClass}>{productName}</h3>
          )}
          <p className="shrink-0 font-en text-[16px] tracking-[0.02em] tabular-nums text-[var(--color-ink)]">
            {formatPrice(lineTotal)}
          </p>
        </div>

        <p className="type-caption mt-1">
          {copy.size} <span className="font-en text-[13px]">{item.variant}</span>
          <span className="mx-2 text-[var(--color-ink-faint)]">/</span>
          <span className="font-en text-[13px] tabular-nums">
            {formatPrice(currentPrice)}
          </span>
        </p>

        {priceChanged ? (
          <p className="type-caption mt-1">
            {copy.priceUpdated(formatPrice(currentPrice))}
          </p>
        ) : null}
        {isUnavailable ? (
          <p className="type-caption mt-1 !text-red-700">{copy.unavailable}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div
            role="group"
            aria-label={copy.qty}
            className="flex items-center border border-[var(--color-hairline)] bg-[var(--color-surface)]"
          >
            <QtyButton
              label={copy.decreaseQty}
              onClick={() =>
                updateQuantity(item.productId, item.variant, item.quantity - 1)
              }
            >
              −
            </QtyButton>
            <span className="min-w-8 text-center font-en text-[15px] tabular-nums text-[var(--color-ink)]">
              {item.quantity}
            </span>
            <QtyButton
              label={copy.increaseQty}
              disabled={atMax || isUnavailable}
              onClick={() =>
                updateQuantity(
                  item.productId,
                  item.variant,
                  Math.min(item.quantity + 1, maxQuantity || item.quantity),
                )
              }
            >
              +
            </QtyButton>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variant)}
            className="type-caption min-h-10 underline decoration-[var(--color-hairline)] underline-offset-4 transition-colors duration-[var(--duration-quiet)] hover:text-[var(--color-ink)] hover:decoration-[var(--color-ink)]"
          >
            {copy.remove}
          </button>
        </div>
      </div>
    </article>
  );
}
