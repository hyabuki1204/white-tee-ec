import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { CheckoutCancelRecovery } from "@/components/checkout/CheckoutCancelRecovery";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";

const { checkout: copy } = GRAPHPAPER_STORE_COPY;

export const metadata: Metadata = buildPageMetadata({
  title: copy.cancelled,
  path: "/checkout/cancel",
  noIndex: true,
});

export default function CheckoutCancelPage() {
  return (
    <Container as="section" className="py-16 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="relative mx-auto aspect-[4/3] max-w-xs overflow-hidden bg-[#f4f4f2]">
          <Image
            src="/store/store-empty-state.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 80vw, 320px"
            className="object-cover opacity-80"
          />
        </div>

        <p className="mt-10 text-[11px] font-light tracking-[0.28em] text-neutral-500">
          {copy.cancelled}
        </p>
        <p className="mt-4 text-[13px] font-light leading-[1.8] tracking-[0.03em] text-neutral-700">
          {copy.paymentIncomplete}
        </p>
        <p className="mt-4 text-[11px] font-light leading-[1.7] tracking-[0.04em] text-neutral-500">
          {copy.cancelRecovery}
        </p>
        <CheckoutCancelRecovery />
        <p className="mt-8">
          <a
            href="/store-guide"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.footer.storeGuide}
          </a>
        </p>
      </div>
    </Container>
  );
}
