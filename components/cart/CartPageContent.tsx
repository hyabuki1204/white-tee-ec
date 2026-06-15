"use client";

import Link from "next/link";
import { CartFabricCrossSell } from "@/components/cart/CartFabricCrossSell";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
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

export function CartPageContent({
  productLookup,
  allProducts,
  fabricNameBySlug,
}: CartPageContentProps) {
  const items = useCartStore((state) => state.items);
  const { cart: copy } = SITE_UI_COPY;

  const crossSellProducts = getFabricCrossSellProducts(
    items.map((item) => item.productId),
    allProducts,
  );

  if (items.length === 0) {
    return (
      <div className="py-16 text-center sm:py-20">
        <p className="text-[13px] tracking-[0.24em] text-neutral-600 md:text-xs md:tracking-[0.3em] md:text-neutral-500">
          {copy.empty}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center px-2 text-[13px] font-light tracking-wide text-neutral-800 transition-opacity active:opacity-60 md:text-xs md:text-neutral-900 md:hover:opacity-60"
          >
            {copy.viewProducts}
          </Link>
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.06em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
          >
            {copy.exploreFabric}
          </Link>
        </div>
      </div>
    );
  }

  let hasUnavailableItems = false;

  const itemElements = items.map((item) => {
    const product = productLookup[item.productId];
    const variantStock =
      product?.variants[item.variant]?.stockQuantity ?? 0;
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
    <div className="max-w-xl">
      <ul className="divide-y divide-neutral-200/70">{itemElements}</ul>

      <CartSummary hasUnavailableItems={hasUnavailableItems} />

      <CartFabricCrossSell
        products={crossSellProducts}
        fabricNameBySlug={fabricNameBySlug}
      />
    </div>
  );
}
