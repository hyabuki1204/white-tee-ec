"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { getCartItemKey } from "@/lib/cart/cart-utils";
import { setLastViewedProductSlug } from "@/lib/navigation/last-product";
import { useCartStore } from "@/lib/cart/store";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Product, ProductSize } from "@/types";

type ProductPurchaseContextValue = {
  product: Product;
  selectedSize: ProductSize | null;
  setSelectedSize: (size: ProductSize) => void;
  recommendedSize: ProductSize | null;
  setRecommendedSize: (size: ProductSize | null) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  inCartQuantity: number;
  maxQuantity: number;
  isOutOfStock: boolean;
  canAdd: boolean;
  buttonLabel: string;
  handleAddToCart: () => void;
  isAdded: boolean;
  openSizeTab: () => void;
  registerOpenSizeTab: (fn: () => void) => void;
  purchaseCtaRef: RefObject<HTMLDivElement | null>;
};

const ProductPurchaseContext = createContext<ProductPurchaseContextValue | null>(
  null,
);

export function useProductPurchase(): ProductPurchaseContextValue {
  const context = useContext(ProductPurchaseContext);

  if (!context) {
    throw new Error("useProductPurchase must be used within ProductPurchaseProvider");
  }

  return context;
}

type ProductPurchaseProviderProps = {
  product: Product;
  children: ReactNode;
};

export function ProductPurchaseProvider({
  product,
  children,
}: ProductPurchaseProviderProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const { openDrawer } = useCartDrawer();
  const { product: copy } = SITE_UI_COPY;

  const [selectedSize, setSelectedSizeState] = useState<ProductSize | null>(null);
  const [recommendedSize, setRecommendedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const purchaseCtaRef = useRef<HTMLDivElement>(null);
  const openSizeTabRef = useRef<(() => void) | null>(null);

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
    setLastViewedProductSlug(product.slug);
  }, [product.slug]);

  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
  }, [maxQuantity, quantity]);

  const setSelectedSize = useCallback((size: ProductSize) => {
    setSelectedSizeState(size);
    setQuantity(1);
    setIsAdded(false);
  }, []);

  const setQuantityWithReset = useCallback((nextQuantity: number) => {
    setQuantity(nextQuantity);
    setIsAdded(false);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize || !canAdd) return;

    addItem({
      productId: product.id,
      variant: selectedSize,
      price: product.price,
      quantity,
    });

    setIsAdded(true);
    openDrawer();
  }, [addItem, canAdd, openDrawer, product.id, product.price, quantity, selectedSize]);

  const registerOpenSizeTab = useCallback((fn: () => void) => {
    openSizeTabRef.current = fn;
  }, []);

  const openSizeTab = useCallback(() => {
    openSizeTabRef.current?.();
    document.getElementById("size-guide")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const buttonLabel = !selectedSize
    ? copy.selectSizeButton
    : isOutOfStock
      ? copy.outOfStock
      : maxQuantity < 1
        ? copy.maxInBag
        : copy.addToBag;

  return (
    <ProductPurchaseContext.Provider
      value={{
        product,
        selectedSize,
        setSelectedSize,
        recommendedSize,
        setRecommendedSize,
        quantity,
        setQuantity: setQuantityWithReset,
        inCartQuantity,
        maxQuantity,
        isOutOfStock,
        canAdd,
        buttonLabel,
        handleAddToCart,
        isAdded,
        openSizeTab,
        registerOpenSizeTab,
        purchaseCtaRef,
      }}
    >
      {children}
    </ProductPurchaseContext.Provider>
  );
}
