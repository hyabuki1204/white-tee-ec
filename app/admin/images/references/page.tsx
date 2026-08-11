import type { Metadata } from "next";
import Link from "next/link";

import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReferenceSetCreateForm } from "@/components/admin/images/ReferenceSetCreateForm";
import { Container } from "@/components/layout/Container";
import {
  adminEmpty,
  adminMuted,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTh,
} from "@/lib/admin/ui";
import { listReferenceSets } from "@/lib/db/images/reference-repository";
import {
  IMAGE_ADMIN_COPY,
  IMAGE_PURPOSE_LABELS,
} from "@/lib/images/labels";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "参照画像セット | 管理画面 | WHITE TEE",
};

export const dynamic = "force-dynamic";

export default async function AdminImageReferencesPage() {
  const configured = isSupabaseConfigured();
  const sets = configured ? await listReferenceSets() : [];
  const copy = IMAGE_ADMIN_COPY.references;

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader title={copy.title} subtitle={`${sets.length} セット`} />

      <div className="mb-6">
        <AdminBackLink href="/admin/images" label="画像ブリーフ一覧へ" />
      </div>

      {!configured ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase が設定されていません。
        </p>
      ) : (
        <>
          <ReferenceSetCreateForm />

          {sets.length === 0 ? (
            <p className={adminEmpty}>{copy.empty}</p>
          ) : (
            <div className={adminTableWrap}>
              <table className={adminTable}>
                <thead>
                  <tr>
                    <th className={adminTh}>名前</th>
                    <th className={adminTh}>用途</th>
                    <th className={adminTh}>画像数</th>
                    <th className={adminTh}>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set) => (
                    <tr key={set.id} className="hover:bg-neutral-50">
                      <td className={adminTd}>
                        <Link
                          href={`/admin/images/references/${set.id}`}
                          className="font-medium underline underline-offset-4"
                        >
                          {set.name}
                        </Link>
                        {set.description ? (
                          <p className={`${adminMuted} mt-1`}>{set.description}</p>
                        ) : null}
                      </td>
                      <td className={adminTd}>
                        {set.purposes.length === 0
                          ? copy.allPurposes
                          : set.purposes
                              .map((purpose) => IMAGE_PURPOSE_LABELS[purpose])
                              .join("、")}
                      </td>
                      <td className={adminTd}>{set.images.length}</td>
                      <td className={adminTd}>
                        {set.isDefault ? (
                          <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                            {copy.defaultBadge}
                          </span>
                        ) : (
                          <span className={adminMuted}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
