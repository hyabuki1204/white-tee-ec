import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrdersPageContent } from "@/components/admin/OrdersPageContent";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { listOrdersPaginated } from "@/lib/orders/queries";

export const metadata: Metadata = {
  title: "注文 | 管理画面 | WHITE TEE",
};

const PAGE_SIZE = 20;

type AdminOrdersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { orders, total } = await listOrdersPaginated(page, PAGE_SIZE);

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.orders.title}
        subtitle={ADMIN_COPY.common.count(total, "注文")}
      />
      <OrdersPageContent
        orders={orders}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
      />
      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
