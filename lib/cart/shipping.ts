export const SHIPPING_FEE = 600;
export const FREE_SHIPPING_THRESHOLD = 10_000;

export function getShippingCost(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0) {
    return 0;
  }

  return SHIPPING_FEE;
}

export function getOrderTotal(subtotal: number): number {
  return subtotal + getShippingCost(subtotal);
}

export function getFreeShippingRemaining(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return FREE_SHIPPING_THRESHOLD - subtotal;
}
