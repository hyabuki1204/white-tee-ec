"use client";

import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { useCartStore } from "@/lib/cart/store";
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
};

export function CartPageContent({ productLookup }: CartPageContentProps) {
  const items = useCartStore((state) => state.items);
  const { cart: copy } = SITE_UI_COPY;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center sm:py-20">
        <p className="text-[13px] tracking-[0.24em] text-neutral-600 md:text-xs md:tracking-[0.3em] md:text-neutral-500">
          {copy.empty}
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-11 items-center justify-center px-2 text-[13px] font-light tracking-wide text-neutral-800 transition-opacity active:opacity-60 md:text-xs md:text-neutral-900 md:hover:opacity-60"
        >
          {copy.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <ul className="divide-y divide-neutral-200/70">
        {items.map((item) => {
          const product = productLookup[item.productId];
          const variantStock =
            product?.variants[item.variant]?.stockQuantity ?? 0;
          const maxQuantity = Math.max(variantStock, 0);
          const isUnavailable = !product || maxQuantity < 1;

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
        })}
      </ul>

      <CartSummary />
    </div>
  );
}
