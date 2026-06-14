import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminLink, adminPageTitle } from "@/lib/admin/ui";

export default function AdminProductNotFound() {
  return (
    <Container as="section" className="py-16 md:py-20">
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className={adminPageTitle}>{ADMIN_COPY.common.notFoundProduct}</p>
        <Link
          href="/admin/products"
          className={`${adminLink} mt-6 inline-block`}
        >
          {ADMIN_COPY.common.backToProducts}
        </Link>
      </div>
    </Container>
  );
}
