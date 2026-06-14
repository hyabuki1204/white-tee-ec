import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PagesEditor } from "@/components/admin/PagesEditor";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getSiteContent } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "固定ページ | 管理画面 | WHITE TEE",
};

export default async function AdminPagesPage() {
  const [legal, contact, shipping, privacy, terms] = await Promise.all([
    getSiteContent("legal"),
    getSiteContent("contact"),
    getSiteContent("shipping"),
    getSiteContent("privacy"),
    getSiteContent("terms"),
  ]);

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.pages.title}
        subtitle={ADMIN_COPY.pages.subtitle}
      />
      <PagesEditor
        initialContent={{ legal, contact, shipping, privacy, terms }}
      />
      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
