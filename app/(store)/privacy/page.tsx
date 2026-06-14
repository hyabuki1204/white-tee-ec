import type { Metadata } from "next";
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
    <LegalPageLayout title={privacy.pageTitle}>
      {privacy.sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-neutral-800">{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </LegalPageLayout>
  );
}
