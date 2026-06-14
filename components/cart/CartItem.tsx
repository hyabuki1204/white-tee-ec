"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatPrice } from "@/lib/utils/format-price";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
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
      className="flex h-10 w-10 items-center justify-center text-sm font-light text-neutral-500 transition-opacity active:opacity-70 disabled:cursor-not-allowed disabled:opacity-30 md:h-auto md:w-auto md:text-xs md:text-neutral-400 md:hover:text-neutral-900"
    >
      {children}
    </button>
  );
}

export function CartItem({
  item,
  productName,
  productSlug,
  imageUrl,
  currentPrice,
  maxQuantity,
  isUnavailable,
}: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { cart: copy, product: productCopy } = SITE_UI_COPY;

  const lineTotal = currentPrice * item.quantity;
  const priceChanged = currentPrice !== item.price;
  const atMax = item.quantity >= maxQuantity && maxQuantity > 0;

  return (
    <article className="flex items-start gap-5 py-7 sm:gap-6 sm:py-8">
      <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden bg-neutral-100 sm:h-20 sm:w-16">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="72px"
            className="object-cover object-center"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-4 sm:gap-6">
        <div className="min-w-0 space-y-2">
          {productSlug ? (
            <Link
              href={`/products/${productSlug}`}
              className="block py-0.5 text-[13px] font-light tracking-wide text-neutral-800 transition-opacity active:opacity-60 md:text-xs md:text-neutral-900 md:hover:opacity-60"
            >
              {productName}
            </Link>
          ) : (
            <h2 className="text-[13px] font-light tracking-wide text-neutral-800 md:text-xs md:text-neutral-900">
              {productName}
            </h2>
          )}
          <p className="text-[13px] font-light text-neutral-600 md:text-xs md:text-neutral-500">
            {productCopy.size} {item.variant} · {productCopy.qty} {item.quantity}
          </p>
          <p className="text-[13px] font-light text-neutral-600 md:text-xs md:text-neutral-500">
            {formatPrice(lineTotal)}
          </p>
          {priceChanged ? (
            <p className="text-[11px] font-light text-neutral-400">
              {productCopy.priceUpdated(formatPrice(currentPrice))}
            </p>
          ) : null}
          {isUnavailable ? (
            <p className="text-[11px] font-light text-red-600/80">
              {copy.unavailable}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-3">
            <QtyButton
              label={copy.decreaseQty}
              onClick={() =>
                updateQuantity(item.productId, item.variant, item.quantity - 1)
              }
            >
              −
            </QtyButton>
            <span className="min-w-6 text-center text-[13px] font-light tabular-nums text-neutral-700 md:min-w-4 md:text-xs">
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
            className="min-h-10 px-1 text-[12px] font-light text-neutral-500 transition-opacity active:opacity-60 md:min-h-0 md:text-xs md:text-neutral-400 md:hover:opacity-60"
          >
            {copy.remove}
          </button>
        </div>
      </div>
    </article>
  );
}
