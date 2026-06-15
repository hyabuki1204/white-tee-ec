import { CheckoutSuccessContent } from "@/components/checkout/CheckoutSuccessContent";
import { getCheckoutSessionSummary } from "@/lib/checkout/session-summary";
import { getFabrics } from "@/lib/fabric/queries";
import { getFabricCrossSellProducts } from "@/lib/products/cross-sell";
import { getProducts } from "@/lib/products/queries";
import { getStripe } from "@/lib/stripe/client";
import { isStripeConfigured } from "@/lib/stripe/client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Order confirmed",
  path: "/checkout/success",
  noIndex: true,
});

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

async function verifyCheckoutSession(
  sessionId: string | undefined,
): Promise<boolean> {
  if (!sessionId || !isStripeConfigured()) {
    return false;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return (
      session.status === "complete" && session.payment_status === "paid"
    );
  } catch {
    return false;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const verified = await verifyCheckoutSession(sessionId);

  const [orderSummary, products, fabrics] = await Promise.all([
    sessionId && verified
      ? getCheckoutSessionSummary(sessionId)
      : Promise.resolve(null),
    getProducts(),
    getFabrics(),
  ]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  const crossSellProducts =
    orderSummary && orderSummary.productIds.length > 0
      ? getFabricCrossSellProducts(orderSummary.productIds, products)
      : [];

  return (
    <CheckoutSuccessContent
      verified={verified}
      sessionId={sessionId}
      orderSummary={orderSummary}
      crossSellProducts={crossSellProducts}
      fabricNameBySlug={fabricNameBySlug}
    />
  );
}
