import type { Metadata } from "next";
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
    <LegalPageLayout title={terms.pageTitle}>
      {terms.sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-neutral-800">{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </LegalPageLayout>
  );
}
