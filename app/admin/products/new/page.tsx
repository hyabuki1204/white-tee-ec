import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { toAdminProductFormDefaults } from "@/lib/admin/product-input";
import { listFabricOptions } from "@/lib/fabric/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "新規商品 | 管理画面 | WHITE TEE",
};

export default async function AdminNewProductPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Container as="section" className="py-10 md:py-12">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ADMIN_COPY.products.supabaseRequired}
        </p>
        <AdminBackLink
          href="/admin/products"
          label={ADMIN_COPY.common.backToProducts}
        />
      </Container>
    );
  }

  const fabrics = await listFabricOptions();

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader title={ADMIN_COPY.products.new} />
      <ProductForm
        mode="create"
        initialProduct={toAdminProductFormDefaults()}
        fabrics={fabrics}
      />
      <AdminBackLink
        href="/admin/products"
        label={ADMIN_COPY.common.backToProducts}
      />
    </Container>
  );
}
