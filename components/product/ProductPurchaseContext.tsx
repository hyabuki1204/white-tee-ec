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
import {
  getInCartQuantity,
  getVariantStock,
  validateAddToCart,
} from "@/lib/cart/stock-validation";
import { setLastViewedProductSlug } from "@/lib/navigation/last-product";
import { useCartStore } from "@/lib/cart/store";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Product, ProductSize } from "@/types";

const ADDED_LABEL_MS = 1500;

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
  addError: string | null;
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
  const { product: copy } = SITE_UI_COPY;

  const [selectedSize, setSelectedSizeState] = useState<ProductSize | null>(null);
  const [recommendedSize, setRecommendedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const purchaseCtaRef = useRef<HTMLDivElement>(null);
  const openSizeTabRef = useRef<(() => void) | null>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inCartQuantity =
    selectedSize !== null
      ? getInCartQuantity(cartItems, product.id, selectedSize)
      : 0;
  const stockQuantity =
    selectedSize !== null ? getVariantStock(product, selectedSize) : 0;
  const maxQuantity = Math.max(0, stockQuantity - inCartQuantity);
  const isOutOfStock = selectedSize !== null ? stockQuantity < 1 : false;
  const canAdd = selectedSize !== null && !isOutOfStock && maxQuantity > 0;

  useEffect(() => {
    setLastViewedProductSlug(product.slug);
  }, [product.slug]);

  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
  }, [maxQuantity, quantity]);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current);
      }
    };
  }, []);

  const setSelectedSize = useCallback((size: ProductSize) => {
    setSelectedSizeState(size);
    setQuantity(1);
    setIsAdded(false);
    setAddError(null);
  }, []);

  const setQuantityWithReset = useCallback((nextQuantity: number) => {
    setQuantity(nextQuantity);
    setIsAdded(false);
    setAddError(null);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      setAddError(copy.chooseSize);
      setIsAdded(false);
      return;
    }

    const validation = validateAddToCart({
      product,
      variant: selectedSize,
      quantity,
      cartItems,
    });

    if (!validation.ok) {
      setAddError(validation.error);
      setIsAdded(false);
      return;
    }

    setAddError(null);

    addItem({
      productId: product.id,
      variant: selectedSize,
      price: product.price,
      quantity,
    });

    setIsAdded(true);
    if (addedTimerRef.current) {
      clearTimeout(addedTimerRef.current);
    }
    addedTimerRef.current = setTimeout(() => {
      setIsAdded(false);
      addedTimerRef.current = null;
    }, ADDED_LABEL_MS);
  }, [
    addItem,
    cartItems,
    copy.chooseSize,
    product,
    quantity,
    selectedSize,
  ]);

  const registerOpenSizeTab = useCallback((fn: () => void) => {
    openSizeTabRef.current = fn;
  }, []);

  const openSizeTab = useCallback(() => {
    openSizeTabRef.current?.();
    document.getElementById("size-guide")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const buttonLabel = isAdded
    ? copy.addedConfirm
    : !selectedSize
      ? copy.addToBag
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
        addError,
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
