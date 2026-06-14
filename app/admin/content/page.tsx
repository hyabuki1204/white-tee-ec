import type { Metadata } from "next";
import Link from "next/link";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Container } from "@/components/layout/Container";
import { getAllSiteContent } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Content | Admin | WHITE TEE",
};

export default async function AdminContentPage() {
  const content = await getAllSiteContent();

  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 space-y-4">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Admin · Content
        </p>
        <p className="text-sm font-light text-neutral-500">
          Edit Home, About, and Stories copy shown on the storefront.
        </p>
      </header>

      <ContentEditor initialContent={content} />

      <Link
        href="/admin"
        className="mt-16 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        ← Back to Admin
      </Link>
    </Container>
  );
}
