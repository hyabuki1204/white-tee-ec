import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
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
        <Link
          href="/cart"
          className="mt-10 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          {copy.backToBag}
        </Link>
      </div>
    </Container>
  );
}
