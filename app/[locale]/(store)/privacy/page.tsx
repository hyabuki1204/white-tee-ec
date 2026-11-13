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

type PrivacyPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const privacy = await getPolicyContent("privacy");

  return buildPageMetadata({
    title: privacy.pageTitle,
    description:
      locale === "en" ? LEGAL_SUMMARY_EN.privacy.lead : "WHITE TEE プライバシーポリシー",
    path: "/privacy",
    locale,
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const locale = await resolveLocale(params);
  const privacy = await getPolicyContent("privacy");

  const original = (
    <InfoRows
      rows={privacy.sections.map((section) => ({
        title: section.title,
        body: section.body,
      }))}
    />
  );

  // English: a summary for convenience, then the governing Japanese text.
  if (locale === "en") {
    return (
      <LegalPageLayout
        label={LEGAL_SUMMARY_EN.privacy.label}
        title={LEGAL_SUMMARY_EN.privacy.title}
      >
        <EnglishLegalNotice page="privacy">{original}</EnglishLegalNotice>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout label={privacy.pageTitle} title="プライバシーポリシー" lead="お客様の個人情報の取り扱いについて。">
      {original}
    </LegalPageLayout>
  );
}
