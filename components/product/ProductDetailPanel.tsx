"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export function ProductDetailPanel({ product, detail }: ProductDetailPanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
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
    ? "Select Size"
    : isOutOfStock
      ? "Out of Stock"
      : maxQuantity < 1
        ? "Max in Bag"
        : "Add to Bag";

  return (
    <div className="space-y-10 md:space-y-12 lg:space-y-14">
      <section aria-label="Purchase options" className="space-y-10 md:space-y-12">
        <div className="space-y-3">
          <VariantSelector
            variants={product.variants}
            selectedSize={selectedSize}
            onSelect={handleSizeSelect}
          />
          {!selectedSize ? (
            <p className="text-[10px] font-light tracking-[0.06em] text-neutral-400">
              Select a size to continue
            </p>
          ) : isOutOfStock ? (
            <p className="text-[10px] font-light tracking-[0.06em] text-neutral-400">
              Size {selectedSize} is out of stock
            </p>
          ) : maxQuantity < 1 ? (
            <p className="text-[10px] font-light tracking-[0.06em] text-neutral-400">
              All available units of size {selectedSize} are in your bag
            </p>
          ) : inCartQuantity > 0 ? (
            <p className="text-[10px] font-light tracking-[0.06em] text-neutral-400">
              {inCartQuantity} in bag · {maxQuantity} more available
            </p>
          ) : null}
        </div>

        {selectedSize ? (
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            max={maxQuantity}
            disabled={!canAdd}
          />
        ) : null}

        <div className="space-y-3">
          <AddToCartButton
            disabled={!canAdd}
            onAdd={handleAddToCart}
            label={buttonLabel}
          />
          {isAdded && selectedSize ? (
            <p className="text-[10px] font-light tracking-[0.06em] text-neutral-400">
              Size {selectedSize}
              {quantity > 1 ? ` · Qty ${quantity}` : ""} added to bag.{" "}
              <Link
                href="/cart"
                className="text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-900"
              >
                View Bag
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <ProductDetailTabs detail={detail} />
    </div>
  );
}
