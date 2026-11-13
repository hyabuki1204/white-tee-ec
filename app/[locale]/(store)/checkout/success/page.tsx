import { CheckoutSuccessContent } from "@/components/checkout/CheckoutSuccessContent";
import { getCheckoutSessionSummary } from "@/lib/checkout/session-summary";
import { getFabrics } from "@/lib/fabric/queries";
import { getFabricCrossSellProducts } from "@/lib/products/cross-sell";
import type { Metadata } from "next";
import { localizeProducts } from "@/lib/i18n/content-en";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/server";
import { getProducts } from "@/lib/products/queries";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import { getStripe } from "@/lib/stripe/client";
import { isStripeConfigured } from "@/lib/stripe/client";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CheckoutSuccessPageProps = {
  params: Promise<LocaleParams>;
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

export async function generateMetadata({
  params,
}: CheckoutSuccessPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return buildPageMetadata({
    title: getStoreCopy(locale).checkout.confirmedLabel,
    path: "/checkout/success",
    locale,
    noIndex: true,
  });
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: CheckoutSuccessPageProps) {
  const locale = await resolveLocale(params);
  const { session_id: sessionId } = await searchParams;
  const verified = await verifyCheckoutSession(sessionId);

  const [orderSummary, storedProducts, fabrics] = await Promise.all([
    sessionId && verified
      ? getCheckoutSessionSummary(sessionId)
      : Promise.resolve(null),
    getProducts(),
    getFabrics(locale),
  ]);
  const products = localizeProducts(storedProducts, locale);

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
