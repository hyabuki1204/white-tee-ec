import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FabricForm } from "@/components/admin/FabricForm";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getAdminFabric } from "@/lib/db/fabrics/admin-repository";

type AdminFabricEditPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AdminFabricEditPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug} | 生地 | 管理画面 | WHITE TEE`,
  };
}

export default async function AdminFabricEditPage({
  params,
}: AdminFabricEditPageProps) {
  const { slug } = await params;
  const fabric = await getAdminFabric(slug);

  if (!fabric) {
    notFound();
  }

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.fabrics.edit}
        subtitle={fabric.name}
      />
      <FabricForm initialFabric={fabric} />
      <AdminBackLink
        href="/admin/fabrics"
        label={ADMIN_COPY.fabrics.backToList}
      />
    </Container>
  );
}
