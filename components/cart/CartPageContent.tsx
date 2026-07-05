"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CartFabricCrossSell } from "@/components/cart/CartFabricCrossSell";
import { CartItem } from "@/components/cart/CartItem";
import { CartOrderNotes } from "@/components/cart/CartOrderNotes";
import { CartStickyCheckout } from "@/components/cart/CartStickyCheckout";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartReconcile } from "@/lib/cart/use-cart-reconcile";
import type { CartStockLookup } from "@/lib/cart/stock-validation";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
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
  const [orderNotes, setOrderNotes] = useState("");
  const { cart: copy } = GRAPHPAPER_STORE_COPY;

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

  if (items.length === 0) {
    return (
      <div className="py-16 text-center sm:py-20">
        <p className="text-[14px] tracking-[0.24em] text-neutral-600 md:text-[13px] md:tracking-[0.3em] md:text-neutral-600">
          {copy.empty}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/products?sleeve=short"
            className="inline-flex min-h-11 items-center justify-center px-2 text-[14px] font-light tracking-wide text-neutral-800 transition-opacity active:opacity-60 md:text-[13px] md:text-neutral-900 md:hover:opacity-60"
          >
            {copy.viewAll}
          </Link>
          <Link
            href="/fabric"
            className="text-[12px] font-light tracking-[0.06em] text-neutral-600 transition-opacity duration-300 hover:opacity-60"
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
    <div className="max-w-xl pb-28 lg:pb-0">
      <div className="relative mb-10 aspect-[21/9] overflow-hidden bg-[#f4f4f2]">
        <Image
          src="/store/checkout-trust.png"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 576px"
          className="object-cover"
        />
      </div>

      {reconcileNotice ? (
        <p
          role="status"
          className="mb-6 text-[12px] font-light leading-[1.8] tracking-[0.04em] text-red-600/90"
        >
          {reconcileNotice}
        </p>
      ) : null}

      <ul className="divide-y divide-neutral-200/70">{itemElements}</ul>

      <CartOrderNotes value={orderNotes} onChange={setOrderNotes} />

      <CartSummary
        hasUnavailableItems={hasUnavailableItems}
        orderNotes={orderNotes}
        hideCheckoutOnMobile
      />

      <CartFabricCrossSell
        products={crossSellProducts}
        fabricNameBySlug={fabricNameBySlug}
      />

      <CartStickyCheckout
        hasUnavailableItems={hasUnavailableItems}
        orderNotes={orderNotes}
      />
    </div>
  );
}
