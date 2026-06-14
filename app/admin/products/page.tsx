import type { Metadata } from "next";
import Link from "next/link";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Container } from "@/components/layout/Container";
import { listProductsForAdmin } from "@/lib/products/admin-queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Products | Admin | WHITE TEE",
};

export default async function AdminProductsPage() {
  const products = isSupabaseConfigured()
    ? await listProductsForAdmin()
    : [];

  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] text-neutral-500">
            Admin · Products
          </p>
          <p className="mt-4 text-sm font-light text-neutral-500">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="text-xs tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60"
        >
          Add Product
        </Link>
      </header>

      {!isSupabaseConfigured() ? (
        <p className="mb-8 text-sm font-light text-neutral-500">
          Supabase is not configured. Set env vars and DATA_SOURCE=supabase to
          manage products.
        </p>
      ) : null}

      <ProductsTable products={products} />

      <Link
        href="/admin"
        className="mt-16 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
      >
        ← Back to Admin
      </Link>
    </Container>
  );
}
