import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReferenceSetEditor } from "@/components/admin/images/ReferenceSetEditor";
import { Container } from "@/components/layout/Container";
import {
  getReferenceSet,
  listReferenceCandidateAssets,
} from "@/lib/db/images/reference-repository";
import { IMAGE_ADMIN_COPY } from "@/lib/images/labels";

export const metadata: Metadata = {
  title: "参照セット編集 | 管理画面 | WHITE TEE",
};

export const dynamic = "force-dynamic";

export default async function AdminImageReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const set = await getReferenceSet(id);

  if (!set) {
    notFound();
  }

  const candidates = await listReferenceCandidateAssets();
  const copy = IMAGE_ADMIN_COPY.references;

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={set.name}
        subtitle={set.isDefault ? copy.defaultBadge : copy.title}
      />

      <div className="mb-6">
        <AdminBackLink
          href="/admin/images/references"
          label="参照セット一覧へ"
        />
      </div>

      <ReferenceSetEditor set={set} candidates={candidates} />
    </Container>
  );
}
