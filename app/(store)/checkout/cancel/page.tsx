import type { Metadata } from "next";
import { CheckoutCancelRecovery } from "@/components/checkout/CheckoutCancelRecovery";
import { PageHeader } from "@/components/layout/PageHeader";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGutterClass } from "@/lib/store-ui/ui-classes";

const { checkout: copy } = GRAPHPAPER_STORE_COPY;

export const metadata: Metadata = buildPageMetadata({
  title: copy.cancelled,
  path: "/checkout/cancel",
  noIndex: true,
});

export default function CheckoutCancelPage() {
  return (
    <>
      <PageHeader
        label="Checkout"
        title={copy.cancelled}
        lead={copy.paymentIncomplete}
      />
      <section
        className={`${pageGutterClass} grid gap-10 py-[var(--space-5)] md:grid-cols-12 md:gap-0 md:py-[var(--space-6)]`}
      >
        <div className="md:col-span-7">
          <h2 className="type-h2">{copy.cancelRecovery}</h2>
          <p className="type-body mt-4 text-[var(--color-ink-soft)]">
            {copy.cancelNext}
          </p>
          <div className="mt-8">
            <CheckoutCancelRecovery />
          </div>
        </div>
      </section>
    </>
  );
}
