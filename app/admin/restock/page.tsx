import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RestockRequestsTable } from "@/components/admin/RestockRequestsTable";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminError, adminMuted } from "@/lib/admin/ui";
import {
  listPendingRestockGroups,
  PENDING_READ_LIMIT,
} from "@/lib/db/restock/repository";
import { isEmailConfigured } from "@/lib/email/send-email";

export const metadata: Metadata = {
  title: "再入荷通知 | 管理画面 | WHITE TEE",
};

export const dynamic = "force-dynamic";

export default async function AdminRestockPage() {
  const copy = ADMIN_COPY.restock;
  const { groups, total, truncated } = await listPendingRestockGroups();

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader title={copy.title} subtitle={copy.subtitle(total)} />

      <div className="mb-6 space-y-2">
        <p className={adminMuted}>{copy.explainer}</p>
        {isEmailConfigured() ? null : (
          <p className={adminError}>{copy.emailNotConfigured}</p>
        )}
        {truncated ? (
          <p className={adminMuted}>{copy.truncated(PENDING_READ_LIMIT)}</p>
        ) : null}
      </div>

      <RestockRequestsTable groups={groups} />

      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
