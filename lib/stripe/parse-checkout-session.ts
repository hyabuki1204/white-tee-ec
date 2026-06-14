import type Stripe from "stripe";
import type { CreateOrderInput, CreateOrderItemInput, ShippingAddress } from "@/types/order";
import type { ProductSize } from "@/types";

const VALID_SIZES: ProductSize[] = ["S", "M", "L", "XL"];

function parseProductSize(value: string | undefined): ProductSize {
  if (!value || !VALID_SIZES.includes(value as ProductSize)) {
    throw new Error(`Invalid variant in Stripe metadata: ${value ?? "missing"}`);
  }

  return value as ProductSize;
}

function mapLineItemToOrderItem(
  item: Stripe.LineItem,
): CreateOrderItemInput {
  const product = item.price?.product;

  if (!product || typeof product === "string" || product.deleted) {
    throw new Error("Stripe line item product was not expanded.");
  }

  const productId = product.metadata?.product_id;
  const variant = parseProductSize(product.metadata?.variant);
  const unitPrice = item.price?.unit_amount;

  if (!productId) {
    throw new Error("Missing product_id in Stripe product metadata.");
  }

  if (unitPrice == null || unitPrice < 0) {
    throw new Error("Missing unit_amount on Stripe line item.");
  }

  if (!item.quantity || item.quantity < 1) {
    throw new Error("Invalid quantity on Stripe line item.");
  }

  return {
    productId,
    variant,
    quantity: item.quantity,
    unitPrice,
  };
}

export function getPaymentIntentId(
  session: Stripe.Checkout.Session,
): string {
  const paymentIntent = session.payment_intent;

  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  if (paymentIntent && typeof paymentIntent === "object" && paymentIntent.id) {
    return paymentIntent.id;
  }

  throw new Error("Checkout session has no payment_intent.");
}

function extractShippingAddress(
  session: Stripe.Checkout.Session,
): ShippingAddress | null {
  type ShippingDetails = {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  };

  const extended = session as Stripe.Checkout.Session & {
    shipping_details?: ShippingDetails | null;
    collected_information?: {
      shipping_details?: ShippingDetails | null;
    } | null;
  };

  const details =
    extended.shipping_details ??
    extended.collected_information?.shipping_details;

  if (!details?.address) {
    return null;
  }

  return {
    name: details.name ?? null,
    line1: details.address.line1 ?? null,
    line2: details.address.line2 ?? null,
    city: details.address.city ?? null,
    state: details.address.state ?? null,
    postalCode: details.address.postal_code ?? null,
    country: details.address.country ?? null,
  };
}

/** Build CreateOrderInput from a completed Checkout Session and its line items. */
export function buildCreateOrderInputFromCheckoutSession(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
): CreateOrderInput {
  if (lineItems.length === 0) {
    throw new Error("Checkout session has no line items.");
  }

  return {
    email: session.customer_details?.email ?? session.customer_email ?? null,
    status: "paid",
    stripePaymentIntentId: getPaymentIntentId(session),
    shippingAddress: extractShippingAddress(session),
    items: lineItems.map(mapLineItemToOrderItem),
  };
}
