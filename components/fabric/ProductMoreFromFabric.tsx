import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Product } from "@/types";

const DISPLAY_LIMIT = 3;

type ProductMoreFromFabricProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
};

export function ProductMoreFromFabric({
  products,
  fabricNameBySlug,
}: ProductMoreFromFabricProps) {
  if (products.length === 0) {
    return null;
  }

  const displayed = products.slice(0, DISPLAY_LIMIT);
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section aria-label={copy.inThisFabric}>
      <Container as="div" className="py-16 sm:py-24 md:py-32 lg:py-40">
        <p className="mb-12 text-center text-[12px] font-light tracking-[0.12em] text-neutral-600 sm:mb-16 md:mb-20 md:text-[12px]">
          {copy.inThisFabric}
        </p>

        <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-x-10 gap-y-24 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-14">
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
