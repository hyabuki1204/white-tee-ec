import type { Metadata } from "next";
import Link from "next/link";
import { OrdersPageContent } from "@/components/admin/OrdersPageContent";
import { Container } from "@/components/layout/Container";
import { listOrders } from "@/lib/orders/queries";

export const metadata: Metadata = {
  title: "Orders | Admin | WHITE TEE",
};

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 md:mb-16">
        <p className="text-xs tracking-[0.3em] text-neutral-500">Admin · Orders</p>
        <p className="mt-4 text-sm font-light text-neutral-500">
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
      </header>

      <OrdersPageContent orders={orders} />

      <Link
        href="/admin"
        className="mt-16 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        ← Back to Admin
      </Link>
    </Container>
  );
}
