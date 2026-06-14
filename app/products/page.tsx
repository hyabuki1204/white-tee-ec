import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Products | WHITE TEE",
  description: "白Tシャツコレクション",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <Container as="section" className="py-20 md:py-32 lg:py-40">
      <header className="mb-20 md:mb-28">
        <p className="text-xs tracking-[0.3em] text-neutral-500">Products</p>
      </header>

      <ProductGrid products={products} />
    </Container>
  );
}
