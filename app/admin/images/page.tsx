import type { Metadata } from "next";
import Link from "next/link";

import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminEmpty,
  adminLink,
  adminMuted,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTh,
} from "@/lib/admin/ui";
import { listAdminImageBriefs } from "@/lib/db/images/admin-repository";
import { countPendingReviews } from "@/lib/db/images/review-repository";
import { getBudgetStatus } from "@/lib/images/jobs/enqueue";
import {
  IMAGE_ADMIN_COPY,
  IMAGE_PURPOSE_LABELS,
  IMAGE_RELEASE_POLICY_BADGE,
  IMAGE_RELEASE_POLICY_LABELS,
  IMAGE_SUBJECT_CLASS_LABELS,
} from "@/lib/images/labels";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "画像生成 | 管理画面 | WHITE TEE",
};

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  const configured = isSupabaseConfigured();

  const [briefs, pendingCount, budget] = configured
    ? await Promise.all([
        listAdminImageBriefs(),
        countPendingReviews(),
        getBudgetStatus(),
      ])
    : [[], 0, null];

  const copy = IMAGE_ADMIN_COPY.briefs;

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={copy.title}
        subtitle={ADMIN_COPY.common.count(briefs.length, "件")}
      />

      {!configured ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ADMIN_COPY.products.supabaseRequired}
        </p>
      ) : null}

      {budget && budget.state !== "ok" ? (
        <p
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            budget.state === "exceeded"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {budget.state === "exceeded"
            ? IMAGE_ADMIN_COPY.budget.exceeded
            : IMAGE_ADMIN_COPY.budget.warning}{" "}
          （{Math.round(budget.spentJpy)} / {budget.monthlyLimitJpy} 円）
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/admin/images/review" className={adminLink}>
          {IMAGE_ADMIN_COPY.review.title}
          {pendingCount > 0 ? `（${pendingCount}）` : ""}
        </Link>
        {budget ? (
          <span className={`${adminMuted} text-xs`}>
            {IMAGE_ADMIN_COPY.budget.label}: {Math.round(budget.spentJpy)} /{" "}
            {budget.monthlyLimitJpy} 円
          </span>
        ) : null}
      </div>

      {briefs.length === 0 ? (
        <p className={adminEmpty}>{copy.empty}</p>
      ) : (
        <div className={adminTableWrap}>
          <table className={adminTable}>
            <thead>
              <tr>
                <th className={adminTh}>{copy.columns.title}</th>
                <th className={adminTh}>{copy.columns.purpose}</th>
                <th className={adminTh}>{copy.columns.subjectClass}</th>
                <th className={adminTh}>{copy.columns.releasePolicy}</th>
                <th className={adminTh}>{copy.columns.pending}</th>
              </tr>
            </thead>
            <tbody>
              {briefs.map((brief) => (
                <tr key={brief.id} className="hover:bg-neutral-50">
                  <td className={adminTd}>
                    <span className="font-medium">{brief.title}</span>
                    <p className={`${adminMuted} mt-1 text-xs`}>
                      {brief.conceptCount} コンセプト
                    </p>
                  </td>
                  <td className={adminTd}>
                    {IMAGE_PURPOSE_LABELS[brief.purpose]}
                  </td>
                  <td className={adminTd}>
                    {IMAGE_SUBJECT_CLASS_LABELS[brief.subjectClass]}
                  </td>
                  <td className={adminTd}>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${IMAGE_RELEASE_POLICY_BADGE[brief.releasePolicy]}`}
                    >
                      {IMAGE_RELEASE_POLICY_LABELS[brief.releasePolicy]}
                    </span>
                  </td>
                  <td className={adminTd}>
                    {brief.pendingReviewCount > 0
                      ? brief.pendingReviewCount
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
