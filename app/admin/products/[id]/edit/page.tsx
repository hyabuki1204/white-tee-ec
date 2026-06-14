import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { Container } from "@/components/layout/Container";
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
      ? `Edit ${product.name} | Admin | WHITE TEE`
      : "Edit Product | Admin | WHITE TEE",
  };
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Container as="section" className="py-16 md:py-24 lg:py-28">
        <p className="text-sm font-light text-neutral-500">
          Supabase is not configured.
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
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 md:mb-16">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Admin · Edit Product
        </p>
        <p className="mt-4 text-sm font-light text-neutral-900">{product.name}</p>
      </header>

      <ProductForm mode="edit" initialProduct={product} fabrics={fabrics} />

      <Link
        href="/admin/products"
        className="mt-16 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        ← Back to Products
      </Link>
    </Container>
  );
}
