import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SeoEditor } from "@/components/admin/SeoEditor";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getSeoSettings } from "@/lib/seo/queries";

export const metadata: Metadata = {
  title: "SEO設定 | 管理画面 | WHITE TEE",
};

export default async function AdminSeoPage() {
  const seo = await getSeoSettings();

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.seo.title}
        subtitle={ADMIN_COPY.seo.subtitle}
      />
      <SeoEditor initialContent={seo} />
      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
