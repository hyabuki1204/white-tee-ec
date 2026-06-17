import { NextResponse } from "next/server";
import {
  buildStripeLineItems,
  getCheckoutSubtotal,
} from "@/lib/checkout/build-line-items";
import { getShippingCost } from "@/lib/cart/shipping";
import { getStripe } from "@/lib/stripe/client";
import type { CheckoutRequestItem } from "@/lib/checkout/build-line-items";

type CheckoutRequestBody = {
  items: CheckoutRequestItem[];
  orderNotes?: string;
};

const ORDER_NOTES_METADATA_KEY = "order_notes";
const MAX_ORDER_NOTES_LENGTH = 500;

function normalizeOrderNotes(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, MAX_ORDER_NOTES_LENGTH);
}

function getOrigin(request: Request): string {
  const origin = request.headers.get("origin");

  if (origin) {
    return origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const lineItems = await buildStripeLineItems(body.items);
    const subtotal = getCheckoutSubtotal(lineItems);
    const shippingCost = getShippingCost(subtotal);
    const origin = getOrigin(request);
    const orderNotes = normalizeOrderNotes(body.orderNotes);

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(orderNotes
        ? { metadata: { [ORDER_NOTES_METADATA_KEY]: orderNotes } }
        : {}),
      shipping_address_collection: {
        allowed_countries: ["JP"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingCost,
              currency: "jpy",
            },
            display_name:
              shippingCost === 0
                ? "Free shipping"
                : "Standard shipping",
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
