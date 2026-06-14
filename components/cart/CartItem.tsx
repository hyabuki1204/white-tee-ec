"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
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

  const lineTotal = currentPrice * item.quantity;
  const priceChanged = currentPrice !== item.price;
  const atMax = item.quantity >= maxQuantity && maxQuantity > 0;

  return (
    <article className="flex items-start gap-6 py-8">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover object-center"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-6">
        <div className="min-w-0 space-y-2">
          {productSlug ? (
            <Link
              href={`/products/${productSlug}`}
              className="block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
            >
              {productName}
            </Link>
          ) : (
            <h2 className="text-xs font-light tracking-wide text-neutral-900">
              {productName}
            </h2>
          )}
          <p className="text-xs font-light text-neutral-500">
            Size {item.variant} · Qty {item.quantity}
          </p>
          <p className="text-xs font-light text-neutral-500">
            {formatPrice(lineTotal)}
          </p>
          {priceChanged ? (
            <p className="text-[10px] font-light text-neutral-400">
              Price updated to {formatPrice(currentPrice)}
            </p>
          ) : null}
          {isUnavailable ? (
            <p className="text-[10px] font-light text-red-600/80">
              Currently unavailable — remove to continue checkout
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.productId, item.variant, item.quantity - 1)
              }
              className="text-xs font-light text-neutral-400 transition-colors hover:text-neutral-900"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-4 text-center text-xs font-light text-neutral-700">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                updateQuantity(
                  item.productId,
                  item.variant,
                  Math.min(item.quantity + 1, maxQuantity || item.quantity),
                )
              }
              disabled={atMax || isUnavailable}
              className="text-xs font-light text-neutral-400 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variant)}
            className="text-xs font-light text-neutral-400 transition-opacity hover:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
