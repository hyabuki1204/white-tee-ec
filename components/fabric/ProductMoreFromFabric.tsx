import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

const DISPLAY_LIMIT = 3;

type ProductMoreFromFabricProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
  title?: string;
};

export function ProductMoreFromFabric({
  products,
  fabricNameBySlug,
  title = "その他のモデル",
}: ProductMoreFromFabricProps) {
  if (products.length === 0) {
    return null;
  }

  const displayed = products.slice(0, DISPLAY_LIMIT);

  return (
    <section aria-label={title}>
      <Container as="div" className="py-[var(--space-6)] md:py-[var(--space-7)]">
        <p className="mb-10 type-label md:mb-12">
          {title}
        </p>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-16 lg:grid-cols-3">
          {displayed.map((product) => (
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
      </Container>
    </section>
  );
}
