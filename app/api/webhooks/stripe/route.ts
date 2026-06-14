import { NextResponse } from "next/server";
import { handleCheckoutSessionCompleted } from "@/lib/stripe/handle-checkout-session-completed";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/client";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const result = await handleCheckoutSessionCompleted(session);

      return NextResponse.json({
        received: true,
        event: event.type,
        orderId: result.orderId,
        duplicate: result.duplicate,
      });
    }

    return NextResponse.json({ received: true, event: event.type });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed.";

    console.error("[stripe webhook]", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
