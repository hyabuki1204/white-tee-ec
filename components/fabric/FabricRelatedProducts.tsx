import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types";

const DISPLAY_LIMIT = 6;

type FabricRelatedProductsProps = {
  products: Product[];
};

export function FabricRelatedProducts({ products }: FabricRelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  const displayed = products.slice(0, DISPLAY_LIMIT);

  return (
    <section className="w-full">
      <ProductGrid products={displayed} />

      <div className="mt-20 md:mt-24">
        <Link
          href="/products"
          className="text-[11px] font-light tracking-[0.08em] text-neutral-500 transition-opacity duration-500 hover:opacity-50"
        >
          View all
        </Link>
      </div>
    </section>
  );
}
