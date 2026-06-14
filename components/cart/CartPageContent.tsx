"use client";

import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
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

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Your cart is empty
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          Continue Shopping
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
