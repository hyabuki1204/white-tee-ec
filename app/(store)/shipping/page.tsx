import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getShippingContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Shipping & Returns",
    description: "配送・返品について",
    path: "/shipping",
  });
}

export default async function ShippingPage() {
  const shipping = await getShippingContent();

  return (
    <LegalPageLayout title={shipping.pageTitle}>
      {shipping.sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-neutral-800">{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </LegalPageLayout>
  );
}
