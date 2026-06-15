import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CheckoutCancelRecovery } from "@/components/checkout/CheckoutCancelRecovery";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { buildPageMetadata } from "@/lib/seo/metadata";

const { checkout: copy } = SITE_UI_COPY;

export const metadata: Metadata = buildPageMetadata({
  title: copy.cancelled,
  path: "/checkout/cancel",
  noIndex: true,
});

export default function CheckoutCancelPage() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          {copy.cancelled}
        </p>
        <p className="mt-6 text-sm font-light text-neutral-700">
          {copy.paymentIncomplete}
        </p>
        <p className="mt-4 text-[11px] font-light tracking-[0.04em] text-neutral-500">
          {copy.cancelRecovery}
        </p>
        <CheckoutCancelRecovery />
      </div>
    </Container>
  );
}
