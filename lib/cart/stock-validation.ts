import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { getCartItemKey } from "@/lib/cart/cart-utils";
import type { CartLineItem } from "@/types/cart";
import type { Product, ProductSize } from "@/types";

export function getVariantStock(
  product: Product,
  variant: ProductSize,
): number {
  return (
    product.variants.find((entry) => entry.size === variant)?.stockQuantity ?? 0
  );
}

export function getInCartQuantity(
  cartItems: CartLineItem[],
  productId: string,
  variant: ProductSize,
): number {
  const key = getCartItemKey(productId, variant);

  return (
    cartItems.find(
      (item) => getCartItemKey(item.productId, item.variant) === key,
    )?.quantity ?? 0
  );
}

export type AddToCartValidationResult =
  | { ok: true; availableQuantity: number }
  | { ok: false; error: string };

/** Server-side truth for whether a line can enter the cart. */
export function validateAddToCart({
  product,
  variant,
  quantity,
  cartItems,
}: {
  product: Product;
  variant: ProductSize;
  quantity: number;
  cartItems: CartLineItem[];
}): AddToCartValidationResult {
  const { product: copy } = SITE_UI_COPY;
  const stock = getVariantStock(product, variant);

  if (stock < 1) {
    return { ok: false, error: copy.cannotAddOutOfStock };
  }

  const inCart = getInCartQuantity(cartItems, product.id, variant);
  const available = stock - inCart;

  if (available < 1) {
    return { ok: false, error: copy.maxInBagError };
  }

  if (quantity < 1) {
    return { ok: false, error: copy.cannotAddOutOfStock };
  }

  if (quantity > available) {
    return { ok: false, error: copy.insufficientStock(available) };
  }

  return { ok: true, availableQuantity: available };
}

export type CartStockLookup = Record<
  string,
  {
    name: string;
    variants: Partial<Record<ProductSize, { stockQuantity: number }>>;
  }
>;

/** Drop or trim lines that exceed live stock (stale cart cleanup). */
export function reconcileCartAgainstStock(
  items: CartLineItem[],
  lookup: CartStockLookup,
): {
  nextItems: CartLineItem[];
  removedCount: number;
  trimmedCount: number;
} {
  const nextItems: CartLineItem[] = [];
  let removedCount = 0;
  let trimmedCount = 0;

  for (const item of items) {
    const product = lookup[item.productId];
    const stock =
      product?.variants[item.variant as ProductSize]?.stockQuantity ?? 0;

    if (!product || stock < 1) {
      removedCount += 1;
      continue;
    }

    if (item.quantity > stock) {
      nextItems.push({ ...item, quantity: stock });
      trimmedCount += 1;
      continue;
    }

    nextItems.push(item);
  }

  return { nextItems, removedCount, trimmedCount };
}
