import type { Metadata } from "next";
import { CheckoutCancelRecovery } from "@/components/checkout/CheckoutCancelRecovery";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGutterClass } from "@/lib/store-ui/ui-classes";

type CheckoutCancelPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: CheckoutCancelPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return buildPageMetadata({
    title: getStoreCopy(locale).checkout.cancelled,
    path: "/checkout/cancel",
    locale,
    noIndex: true,
  });
}

export default async function CheckoutCancelPage({
  params,
}: CheckoutCancelPageProps) {
  const locale = await resolveLocale(params);
  const { checkout: copy } = getStoreCopy(locale);

  return (
    <>
      <PageHeader
        label={copy.label}
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
