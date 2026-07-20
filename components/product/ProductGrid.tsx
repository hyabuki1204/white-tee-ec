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
      <p className="py-16 text-center text-[14px] font-normal tracking-wide text-[var(--color-ink-soft)]">
        No pieces match these filters.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-16 lg:grid-cols-3">
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
