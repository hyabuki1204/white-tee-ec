import type { Metadata } from "next";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { EnglishLegalNotice } from "@/components/legal/EnglishLegalNotice";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { getPolicyContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { LEGAL_SUMMARY_EN } from "@/lib/store-ui/info-pages";

type TermsPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const terms = await getPolicyContent("terms");

  return buildPageMetadata({
    title: terms.pageTitle,
    description:
      locale === "en" ? LEGAL_SUMMARY_EN.terms.lead : "WHITE TEE 利用規約",
    path: "/terms",
    locale,
  });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const locale = await resolveLocale(params);
  const terms = await getPolicyContent("terms");

  const original = (
    <InfoRows
      rows={terms.sections.map((section) => ({
        title: section.title,
        body: section.body,
      }))}
    />
  );

  // English: a summary for convenience, then the governing Japanese text.
  if (locale === "en") {
    return (
      <LegalPageLayout
        label={LEGAL_SUMMARY_EN.terms.label}
        title={LEGAL_SUMMARY_EN.terms.title}
      >
        <EnglishLegalNotice page="terms">{original}</EnglishLegalNotice>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout label={terms.pageTitle} title="利用規約" lead="オンラインストアのご利用条件について。">
      {original}
    </LegalPageLayout>
  );
}
