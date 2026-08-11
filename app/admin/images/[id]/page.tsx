import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BriefWorkbench } from "@/components/admin/images/BriefWorkbench";
import { Container } from "@/components/layout/Container";
import { getAdminImageBrief } from "@/lib/db/images/admin-repository";
import { listImageConcepts, listImageJobs } from "@/lib/db/images/repository";
import { isClaudeConfigured } from "@/lib/images/director/client";
import { getImageProviderId, isMockImageProvider } from "@/lib/images/env";
import {
  IMAGE_PURPOSE_LABELS,
  IMAGE_RELEASE_POLICY_BADGE,
  IMAGE_RELEASE_POLICY_LABELS,
  IMAGE_SUBJECT_CLASS_LABELS,
} from "@/lib/images/labels";
import { adminMuted } from "@/lib/admin/ui";
import type { AdminImageJob } from "@/types/admin-image";

export const metadata: Metadata = {
  title: "画像ブリーフ | 管理画面 | WHITE TEE",
};

export const dynamic = "force-dynamic";

export default async function AdminImageBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brief = await getAdminImageBrief(id);

  if (!brief) {
    notFound();
  }

  const concepts = await listImageConcepts(brief.id);
  const jobLists = await Promise.all(
    concepts.map((concept) => listImageJobs(concept.id)),
  );

  const jobsByConcept: Record<string, AdminImageJob[]> = {};

  concepts.forEach((concept, index) => {
    jobsByConcept[concept.id] = jobLists[index] ?? [];
  });

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={brief.title}
        subtitle={`${IMAGE_PURPOSE_LABELS[brief.purpose]} / ${IMAGE_SUBJECT_CLASS_LABELS[brief.subjectClass]}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${IMAGE_RELEASE_POLICY_BADGE[brief.releasePolicy]}`}
        >
          {IMAGE_RELEASE_POLICY_LABELS[brief.releasePolicy]}
        </span>
        <span className={`${adminMuted} text-xs`}>
          生成枚数 {brief.desiredVariantCount}
        </span>
      </div>

      {brief.intent ? (
        <p className="mb-8 whitespace-pre-wrap text-sm">{brief.intent}</p>
      ) : null}

      <BriefWorkbench
        briefId={brief.id}
        concepts={concepts}
        jobsByConcept={jobsByConcept}
        claudeConfigured={isClaudeConfigured()}
        providerId={getImageProviderId()}
        isMockProvider={isMockImageProvider()}
      />

      <AdminBackLink href="/admin/images" label="画像ブリーフ一覧へ" />
    </Container>
  );
}
