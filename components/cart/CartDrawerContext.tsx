"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/types";

type CartDrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

type CartDrawerProviderProps = {
  children: React.ReactNode;
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

export function CartDrawerProvider({
  children,
  products,
  fabricNameBySlug,
}: CartDrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((open) => !open), []);

  const value = useMemo(
    () => ({
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      products,
      fabricNameBySlug,
    }),
    [closeDrawer, fabricNameBySlug, isOpen, openDrawer, products, toggleDrawer],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);

  if (!context) {
    throw new Error("useCartDrawer must be used within CartDrawerProvider");
  }

  return context;
}
