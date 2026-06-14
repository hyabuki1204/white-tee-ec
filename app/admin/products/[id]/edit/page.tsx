import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getProductForAdmin } from "@/lib/products/admin-queries";
import { listFabricOptions } from "@/lib/fabric/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdminEditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = isSupabaseConfigured()
    ? await getProductForAdmin(id)
    : null;

  return {
    title: product
      ? `${product.name} 編集 | 管理画面 | WHITE TEE`
      : "商品編集 | 管理画面 | WHITE TEE",
  };
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Container as="section" className="py-10 md:py-12">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ADMIN_COPY.products.supabaseRequired}
        </p>
      </Container>
    );
  }

  const [product, fabrics] = await Promise.all([
    getProductForAdmin(id),
    listFabricOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.products.edit}
        subtitle={product.name}
      />
      <ProductForm mode="edit" initialProduct={product} fabrics={fabrics} />
      <AdminBackLink
        href="/admin/products"
        label={ADMIN_COPY.common.backToProducts}
      />
    </Container>
  );
}
