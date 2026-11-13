import type { Metadata } from "next";
import { Link } from "@/components/i18n/Link";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { OverseasInterest } from "@/components/newsletter/OverseasInterest";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { getShippingContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getShippingPageCopy,
  SHIPPING_SECTIONS_EN,
} from "@/lib/store-ui/info-pages";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/lib/store-ui/ui-classes";

type ShippingPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: ShippingPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const copy = getShippingPageCopy(locale);

  return buildPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/shipping",
    locale,
  });
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  const locale = await resolveLocale(params);
  const copy = getShippingPageCopy(locale);
  const shipping = await getShippingContent();
  // The stored sections are Japanese only; English has its own static set.
  const sections = locale === "en" ? SHIPPING_SECTIONS_EN : shipping.sections;

  return (
    <LegalPageLayout
      label={shipping.pageTitle}
      title={copy.title}
      lead={copy.lead}
    >
      <dl className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {copy.facts.map((fact) => (
          <div key={fact.label} className="border-t border-[var(--color-ink)] pt-4">
            <dd className="font-en text-[clamp(28px,3.6vw,44px)] font-light leading-none tracking-[-0.02em] tabular-nums text-[var(--color-ink)]">
              {fact.value}
              {fact.unit ? (
                <span
                  className={
                    locale === "en"
                      ? "ml-1.5 text-[13px] font-normal tracking-[0.04em]"
                      : "ml-1 font-[family-name:var(--font-sans-jp)] text-[13px] font-normal tracking-[0.04em]"
                  }
                >
                  {fact.unit}
                </span>
              ) : null}
            </dd>
            <dt className="type-caption mt-3">{fact.label}</dt>
          </div>
        ))}
      </dl>

      <InfoRows
        className="mt-[var(--space-5)]"
        rows={sections.map((section) => ({
          title: section.title,
          body: section.body,
        }))}
      />

      <OverseasInterest className="mt-[var(--space-5)]" />

      <div className="mt-[var(--space-4)] flex flex-wrap gap-3">
        <Link href="/contact" className={buttonPrimaryClass}>
          {copy.contactCta}
        </Link>
        <Link href="/store-guide" className={buttonSecondaryClass}>
          {copy.guideCta}
        </Link>
      </div>
    </LegalPageLayout>
  );
}
