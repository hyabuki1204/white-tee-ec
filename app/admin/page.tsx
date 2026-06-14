import type { Metadata } from "next";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionList } from "@/components/common/AdminSectionList";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getDashboardStats } from "@/lib/admin/dashboard-stats";
import { ADMIN_SECTIONS } from "@/lib/admin/sections";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "管理画面 | WHITE TEE",
};

export default async function AdminPage() {
  const stats = isSupabaseConfigured()
    ? await getDashboardStats()
    : {
        unshippedCount: 0,
        lowStockProducts: [],
        recentOrders: [],
      };

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.dashboard.title}
        subtitle={ADMIN_COPY.dashboard.subtitle}
      />
      {isSupabaseConfigured() ? <DashboardStats stats={stats} /> : null}
      <AdminSectionList sections={ADMIN_SECTIONS} />
    </Container>
  );
}
