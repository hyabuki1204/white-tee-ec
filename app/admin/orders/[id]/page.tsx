import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderDetailSummary } from "@/components/admin/OrderDetailSummary";
import { OrderItemsTable } from "@/components/admin/OrderItemsTable";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminSection, adminSectionTitle } from "@/lib/admin/ui";
import { getAdminOrderDetail } from "@/lib/orders/queries";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `注文 ${id.slice(0, 8)} | 管理画面 | WHITE TEE`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);

  if (!order) {
    notFound();
  }

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.orders.detailTitle}
        subtitle={`ID: ${order.id.slice(0, 8)}…`}
      />

      <div className="space-y-6">
        <OrderDetailSummary order={order} />
        <OrderStatusUpdater
          orderId={order.id}
          currentStatus={order.status}
          resendConfigured={Boolean(process.env.RESEND_API_KEY)}
        />

        <section className={adminSection}>
          <h2 className={adminSectionTitle}>{ADMIN_COPY.orders.items}</h2>
          <OrderItemsTable items={order.items} />
        </section>
      </div>

      <AdminBackLink href="/admin/orders" label={ADMIN_COPY.common.backToOrders} />
    </Container>
  );
}
