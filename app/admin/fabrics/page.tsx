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
import { listAdminFabrics } from "@/lib/db/fabrics/admin-repository";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "生地 | 管理画面 | WHITE TEE",
};

export default async function AdminFabricsPage() {
  const fabrics = isSupabaseConfigured() ? await listAdminFabrics() : [];
  const copy = ADMIN_COPY.fabrics;

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={copy.title}
        subtitle={ADMIN_COPY.common.count(fabrics.length, "生地")}
      />

      {!isSupabaseConfigured() ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ADMIN_COPY.products.supabaseRequired}
        </p>
      ) : null}

      {fabrics.length === 0 ? (
        <p className={adminEmpty}>{copy.empty}</p>
      ) : (
        <div className={adminTableWrap}>
          <table className={adminTable}>
            <thead>
              <tr>
                <th className={adminTh}>{copy.columns.name}</th>
                <th className={adminTh}>{copy.columns.tagline}</th>
                <th className={adminTh}>{copy.columns.sortOrder}</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map((fabric) => (
                <tr key={fabric.slug} className="hover:bg-neutral-50">
                  <td className={adminTd}>
                    <Link
                      href={`/admin/fabrics/${fabric.slug}/edit`}
                      className={`${adminLink} font-medium no-underline hover:underline`}
                    >
                      {fabric.name}
                    </Link>
                    <p className={`${adminMuted} mt-1 text-xs`}>{fabric.slug}</p>
                  </td>
                  <td className={adminTd}>{fabric.tagline}</td>
                  <td className={adminTd}>{fabric.sortOrder}</td>
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
