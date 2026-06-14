import type { ProductSize } from "@/types";

/** A single line in the shopping cart. */
export type CartLineItem = {
  productId: string;
  variant: ProductSize;
  quantity: number;
  price: number;
};

/** Input when adding an item to the cart. */
export type AddToCartInput = {
  productId: string;
  variant: ProductSize;
  price: number;
  quantity?: number;
};
