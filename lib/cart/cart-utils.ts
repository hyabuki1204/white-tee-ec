import type { CartLineItem } from "@/types/cart";
import type { ProductSize } from "@/types";

export function getCartItemKey(productId: string, variant: ProductSize): string {
  return `${productId}:${variant}`;
}

export function calculateCartTotal(items: CartLineItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function calculateCartCount(items: CartLineItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
