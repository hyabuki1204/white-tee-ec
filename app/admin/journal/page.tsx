import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JournalEditor } from "@/components/admin/JournalEditor";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getSiteContent } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Journal | 管理画面 | WHITE TEE",
};

export default async function AdminJournalPage() {
  const journal = await getSiteContent("journal");

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.journal.title}
        subtitle={ADMIN_COPY.journal.subtitle}
      />
      <JournalEditor initialContent={journal} />
      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
