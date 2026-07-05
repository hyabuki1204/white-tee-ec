import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  calculateCartCount,
  calculateCartTotal,
  getCartItemKey,
} from "@/lib/cart/cart-utils";
import type { AddToCartInput, CartLineItem } from "@/types/cart";
import type { ProductSize } from "@/types";

type CartState = {
  items: CartLineItem[];
  addItem: (input: AddToCartInput) => void;
  removeItem: (productId: string, variant: ProductSize) => void;
  updateQuantity: (
    productId: string,
    variant: ProductSize,
    quantity: number,
  ) => void;
  clearCart: () => void;
  replaceItems: (items: CartLineItem[]) => void;
  getTotal: () => number;
  getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ productId, variant, price, quantity = 1 }) => {
        set((state) => {
          const key = getCartItemKey(productId, variant);
          const existingIndex = state.items.findIndex(
            (item) => getCartItemKey(item.productId, item.variant) === key,
          );

          if (existingIndex === -1) {
            return {
              items: [
                ...state.items,
                { productId, variant, price, quantity },
              ],
            };
          }

          const nextItems = [...state.items];
          nextItems[existingIndex] = {
            ...nextItems[existingIndex],
            quantity: nextItems[existingIndex].quantity + quantity,
          };

          return { items: nextItems };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              getCartItemKey(item.productId, item.variant) !==
              getCartItemKey(productId, variant),
          ),
        }));
      },

      updateQuantity: (productId, variant, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variant);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item.productId, item.variant) ===
            getCartItemKey(productId, variant)
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      replaceItems: (items) => set({ items }),

      getTotal: () => calculateCartTotal(get().items),

      getItemCount: () => calculateCartCount(get().items),
    }),
    {
      name: "white-tee-cart",
    },
  ),
);
