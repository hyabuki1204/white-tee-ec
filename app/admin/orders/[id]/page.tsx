import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetailSummary } from "@/components/admin/OrderDetailSummary";
import { OrderItemsTable } from "@/components/admin/OrderItemsTable";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { Container } from "@/components/layout/Container";
import { getAdminOrderDetail } from "@/lib/orders/queries";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Order ${id.slice(0, 8)} | Admin | WHITE TEE`,
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
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 md:mb-16">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Admin · Order
        </p>
      </header>

      <OrderDetailSummary order={order} />

      <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

      <section className="pt-12">
        <h2 className="mb-8 text-xs font-light tracking-wide text-neutral-500">
          Items
        </h2>
        <OrderItemsTable items={order.items} />
      </section>

      <Link
        href="/admin/orders"
        className="mt-16 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        ← Back to Orders
      </Link>
    </Container>
  );
}
