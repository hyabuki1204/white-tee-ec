import { getStripe } from "@/lib/stripe/client";

export type CheckoutOrderLineItem = {
  name: string;
  quantity: number;
  amount: number;
  productId: string | null;
};

export type CheckoutOrderSummary = {
  lineItems: CheckoutOrderLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
  productIds: string[];
};

export async function getCheckoutSessionSummary(
  sessionId: string,
): Promise<CheckoutOrderSummary | null> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    const lineItems = session.line_items?.data ?? [];
    const parsed: CheckoutOrderLineItem[] = lineItems.map((item) => {
      const product = item.price?.product;
      const metadata =
        product && typeof product === "object" && "metadata" in product
          ? (product.metadata as Record<string, string>)
          : {};

      return {
        name: item.description ?? "Item",
        quantity: item.quantity ?? 1,
        amount: item.amount_total ?? 0,
        productId: metadata.product_id ?? null,
      };
    });

    const productIds = parsed
      .map((item) => item.productId)
      .filter((id): id is string => Boolean(id));

    const subtotal = parsed.reduce((sum, item) => sum + item.amount, 0);
    const shipping = session.total_details?.amount_shipping ?? 0;
    const total = session.amount_total ?? subtotal + shipping;

    return {
      lineItems: parsed,
      subtotal,
      shipping,
      total,
      productIds,
    };
  } catch {
    return null;
  }
}
