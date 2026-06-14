import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { Container } from "@/components/layout/Container";
import { toAdminProductFormDefaults } from "@/lib/admin/product-input";
import { listFabricOptions } from "@/lib/fabric/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "New Product | Admin | WHITE TEE",
};

export default async function AdminNewProductPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Container as="section" className="py-16 md:py-24 lg:py-28">
        <p className="text-sm font-light text-neutral-500">
          Supabase is not configured.
        </p>
        <Link
          href="/admin/products"
          className="mt-8 inline-block text-xs font-light tracking-wide text-neutral-900"
        >
          ← Back to Products
        </Link>
      </Container>
    );
  }

  const fabrics = await listFabricOptions();

  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 md:mb-16">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Admin · New Product
        </p>
      </header>

      <ProductForm
        mode="create"
        initialProduct={toAdminProductFormDefaults()}
        fabrics={fabrics}
      />

      <Link
        href="/admin/products"
        className="mt-16 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        ← Back to Products
      </Link>
    </Container>
  );
}
