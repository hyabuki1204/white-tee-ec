import { getStripe } from "@/lib/stripe/client";
import {
  buildCreateOrderInputFromCheckoutSession,
  getPaymentIntentId,
} from "@/lib/stripe/parse-checkout-session";
import {
  createOrder,
  getOrderByStripePaymentIntentId,
} from "@/lib/orders/mutations";
import type Stripe from "stripe";

export type HandleCheckoutSessionResult = {
  orderId: string;
  duplicate: boolean;
};

/**
 * Process checkout.session.completed:
 * - fetch line items from Stripe
 * - skip if order already exists (idempotency)
 * - save order to Supabase via createOrder()
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<HandleCheckoutSessionResult> {
  const stripe = getStripe();

  const paymentIntentId = getPaymentIntentId(session);

  const existingOrder =
    await getOrderByStripePaymentIntentId(paymentIntentId);

  if (existingOrder) {
    return { orderId: existingOrder.id, duplicate: true };
  }

  const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
    session.id,
    { expand: ["data.price.product"] },
  );

  const orderInput = buildCreateOrderInputFromCheckoutSession(
    session,
    lineItems,
  );

  const order = await createOrder(orderInput);

  return { orderId: order.id, duplicate: false };
}
