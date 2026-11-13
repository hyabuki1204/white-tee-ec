import type { Metadata } from "next";
import { Link } from "@/components/i18n/Link";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getStoreGuide } from "@/lib/store-ui/store-guide";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/lib/store-ui/ui-classes";

type StoreGuidePageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: StoreGuidePageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const guide = getStoreGuide(locale);

  return buildPageMetadata({
    title: guide.title,
    description: guide.intro,
    path: "/store-guide",
    locale,
  });
}

export default async function StoreGuidePage({ params }: StoreGuidePageProps) {
  const locale = await resolveLocale(params);
  const guide = getStoreGuide(locale);

  return (
    <LegalPageLayout label={guide.label} title={guide.title} lead={guide.intro}>
      <InfoRows
        numbered
        rows={guide.sections.map((section) => ({
          title: section.title,
          body: section.summary,
          href: section.href,
          linkLabel: section.linkLabel,
        }))}
      />

      <div className="mt-[var(--space-4)] flex flex-wrap gap-3">
        <Link href="/shipping" className={buttonPrimaryClass}>
          {guide.shippingDetail}
        </Link>
        <Link href="/contact" className={buttonSecondaryClass}>
          {guide.contact}
        </Link>
      </div>
    </LegalPageLayout>
  );
}
