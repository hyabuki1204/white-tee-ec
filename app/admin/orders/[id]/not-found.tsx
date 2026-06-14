import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminLink, adminPageTitle } from "@/lib/admin/ui";

export default function AdminOrderNotFound() {
  return (
    <Container as="section" className="py-16 md:py-20">
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className={adminPageTitle}>{ADMIN_COPY.common.notFoundOrder}</p>
        <Link href="/admin/orders" className={`${adminLink} mt-6 inline-block`}>
          {ADMIN_COPY.common.backToOrders}
        </Link>
      </div>
    </Container>
  );
}
