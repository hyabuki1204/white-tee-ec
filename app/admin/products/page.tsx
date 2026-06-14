import type { Metadata } from "next";
import Link from "next/link";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductsPageContent } from "@/components/admin/ProductsPageContent";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminBtnPrimary } from "@/lib/admin/ui";
import { listProductsForAdmin } from "@/lib/products/admin-queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "商品 | 管理画面 | WHITE TEE",
};

export default async function AdminProductsPage() {
  const products = isSupabaseConfigured()
    ? await listProductsForAdmin()
    : [];

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.products.title}
        subtitle={ADMIN_COPY.common.count(products.length, "商品")}
        actions={
          <Link href="/admin/products/new" className={adminBtnPrimary}>
            {ADMIN_COPY.products.add}
          </Link>
        }
      />

      {!isSupabaseConfigured() ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ADMIN_COPY.products.supabaseRequired}
        </p>
      ) : null}

      <ProductsPageContent products={products} />
      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
