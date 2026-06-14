import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { SHIPPING_SECTIONS } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Shipping & Returns | WHITE TEE",
  description: "配送・返品について",
};

export default function ShippingPage() {
  return (
    <LegalPageLayout title="Shipping & Returns">
      {SHIPPING_SECTIONS.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-neutral-800">{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </LegalPageLayout>
  );
}
