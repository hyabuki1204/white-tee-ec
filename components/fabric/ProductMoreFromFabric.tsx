import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

type ProductMoreFromFabricProps = {
  products: Product[];
};

export function ProductMoreFromFabric({ products }: ProductMoreFromFabricProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-label="More from this fabric">
      <Container as="div" className="py-20 md:py-28 lg:py-32">
        <p className="mb-14 text-[10px] font-light tracking-[0.14em] text-neutral-400 md:mb-16">
          More from this fabric
        </p>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-12">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
