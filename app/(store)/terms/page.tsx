import type { Metadata } from "next";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getPolicyContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const terms = await getPolicyContent("terms");

  return buildPageMetadata({
    title: terms.pageTitle,
    description: "WHITE TEE 利用規約",
    path: "/terms",
  });
}

export default async function TermsPage() {
  const terms = await getPolicyContent("terms");

  return (
    <LegalPageLayout label={terms.pageTitle} title="利用規約" lead="オンラインストアのご利用条件について。">
      <InfoRows
        rows={terms.sections.map((section) => ({
          title: section.title,
          body: section.body,
        }))}
      />
    </LegalPageLayout>
  );
}
