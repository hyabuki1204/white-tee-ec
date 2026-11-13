import type { Metadata } from "next";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getPolicyContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const privacy = await getPolicyContent("privacy");

  return buildPageMetadata({
    title: privacy.pageTitle,
    description: "WHITE TEE プライバシーポリシー",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const privacy = await getPolicyContent("privacy");

  return (
    <LegalPageLayout label={privacy.pageTitle} title="プライバシーポリシー" lead="お客様の個人情報の取り扱いについて。">
      <InfoRows
        rows={privacy.sections.map((section) => ({
          title: section.title,
          body: section.body,
        }))}
      />
    </LegalPageLayout>
  );
}
