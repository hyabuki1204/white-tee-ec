import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

type ProductGridProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
};

export function ProductGrid({
  products,
  fabricNameBySlug,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-[13px] font-light tracking-wide text-neutral-600">
        No pieces match these filters.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            fabricName={
              product.fabricSlug && fabricNameBySlug
                ? fabricNameBySlug[product.fabricSlug]
                : null
            }
          />
        </li>
      ))}
    </ul>
  );
}
