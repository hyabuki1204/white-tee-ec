import { getCheckoutProductsByIds } from "@/lib/db/products/admin-repository";
import { getDataSource } from "@/lib/supabase/env";
import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import type { CartLineItem } from "@/types/cart";
import type Stripe from "stripe";

export type CheckoutRequestItem = Pick<
  CartLineItem,
  "productId" | "variant" | "quantity" | "price"
>;

type CheckoutProduct = {
  id: string;
  name: string;
  price: number;
  variants: Array<{ size: string; stock_quantity: number }>;
};

async function getCheckoutProducts(
  productIds: string[],
): Promise<Map<string, CheckoutProduct>> {
  if (getDataSource() === "supabase") {
    return getCheckoutProductsByIds(productIds);
  }

  return new Map(
    MOCK_PRODUCTS.filter((product) => productIds.includes(product.id)).map(
      (product) => [
        product.id,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          variants: product.variants.map((variant) => ({
            size: variant.size,
            stock_quantity: variant.stockQuantity,
          })),
        },
      ],
    ),
  );
}

/** Validate cart items and build Stripe line_items with server-side prices. */
export function getCheckoutSubtotal(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
): number {
  return lineItems.reduce((sum, item) => {
    const unitAmount = item.price_data?.unit_amount ?? 0;
    const quantity = item.quantity ?? 1;
    return sum + unitAmount * quantity;
  }, 0);
}

/** Validate cart items and build Stripe line_items with server-side prices. */
export async function buildStripeLineItems(
  items: CheckoutRequestItem[],
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await getCheckoutProducts(productIds);

  return items.map((item) => {
    const product = products.get(item.productId);

    if (!product) {
      throw new Error(`Unknown or unavailable product: ${item.productId}`);
    }

    if (item.quantity < 1) {
      throw new Error(`Invalid quantity for ${product.name}.`);
    }

    const variant = product.variants.find(
      (entry) => entry.size === item.variant,
    );

    if (!variant) {
      throw new Error(`Size ${item.variant} is not available for ${product.name}.`);
    }

    if (variant.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (${item.variant}).`);
    }

    const unitAmount = product.price;

    return {
      quantity: item.quantity,
      price_data: {
        currency: "jpy",
        unit_amount: unitAmount,
        product_data: {
          name: `${product.name} (${item.variant})`,
          metadata: {
            product_id: product.id,
            variant: item.variant,
          },
        },
      },
    };
  });
}
