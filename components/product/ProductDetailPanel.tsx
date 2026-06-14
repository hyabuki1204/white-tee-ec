"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { VariantSelector } from "@/components/product/VariantSelector";
import { getCartItemKey } from "@/lib/cart/cart-utils";
import { useCartStore } from "@/lib/cart/store";
import type { Product, ProductDetailContent, ProductSize } from "@/types";

type ProductDetailPanelProps = {
  product: Product;
  detail: ProductDetailContent;
};

function PurchaseStatus({
  selectedSize,
  isOutOfStock,
  maxQuantity,
  inCartQuantity,
}: {
  selectedSize: ProductSize | null;
  isOutOfStock: boolean;
  maxQuantity: number;
  inCartQuantity: number;
}) {
  const { product: copy } = SITE_UI_COPY;

  if (!selectedSize) {
    return (
      <p className="min-h-[1rem] text-[10px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {copy.chooseSize}
      </p>
    );
  }

  if (isOutOfStock) {
    return (
      <p className="min-h-[1rem] text-[10px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {copy.unavailable}
      </p>
    );
  }

  if (maxQuantity < 1) {
    return (
      <p className="min-h-[1rem] text-[10px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {copy.allInBag}
      </p>
    );
  }

  if (inCartQuantity > 0) {
    return (
      <p className="min-h-[1rem] text-[10px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {copy.inBagMore(inCartQuantity, maxQuantity)}
      </p>
    );
  }

  return <div className="min-h-[1rem]" aria-hidden />;
}

export function ProductDetailPanel({ product, detail }: ProductDetailPanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const { product: copy } = SITE_UI_COPY;
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = product.variants.find(
    (variant) => variant.size === selectedSize,
  );
  const inCartQuantity =
    selectedSize !== null
      ? (cartItems.find(
          (item) =>
            getCartItemKey(item.productId, item.variant) ===
            getCartItemKey(product.id, selectedSize),
        )?.quantity ?? 0)
      : 0;
  const stockQuantity = selectedVariant?.stockQuantity ?? 0;
  const maxQuantity = Math.max(0, stockQuantity - inCartQuantity);
  const isOutOfStock = selectedVariant ? stockQuantity < 1 : false;
  const canAdd = selectedSize !== null && !isOutOfStock && maxQuantity > 0;

  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
  }, [maxQuantity, quantity]);

  const handleSizeSelect = (size: ProductSize) => {
    setSelectedSize(size);
    setQuantity(1);
    setIsAdded(false);
  };

  const handleQuantityChange = (nextQuantity: number) => {
    setQuantity(nextQuantity);
    setIsAdded(false);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !canAdd) return;

    addItem({
      productId: product.id,
      variant: selectedSize,
      price: product.price,
      quantity,
    });

    setIsAdded(true);
  };

  const buttonLabel = !selectedSize
    ? copy.selectSizeButton
    : isOutOfStock
      ? copy.outOfStock
      : maxQuantity < 1
        ? copy.maxInBag
        : copy.addToBag;

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20">
      <section aria-label="Purchase options" className="space-y-10 sm:space-y-12 md:space-y-14">
        <div className="space-y-4">
          <VariantSelector
            variants={product.variants}
            selectedSize={selectedSize}
            onSelect={handleSizeSelect}
          />
          <PurchaseStatus
            selectedSize={selectedSize}
            isOutOfStock={isOutOfStock}
            maxQuantity={maxQuantity}
            inCartQuantity={inCartQuantity}
          />
        </div>

        {selectedSize ? (
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            max={maxQuantity}
            disabled={!canAdd}
          />
        ) : null}

        <div className="space-y-4">
          <AddToCartButton
            disabled={!canAdd}
            onAdd={handleAddToCart}
            label={buttonLabel}
          />
          <div aria-live="polite" className="min-h-[1.25rem]">
            {isAdded && selectedSize ? (
              <p className="text-[10px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
                {copy.added(selectedSize, quantity > 1 ? quantity : undefined)}.{" "}
                <Link
                  href="/cart"
                  className="text-neutral-600 transition-opacity duration-300 hover:opacity-50"
                >
                  {copy.viewBag}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <ProductDetailTabs detail={detail} />
    </div>
  );
}
