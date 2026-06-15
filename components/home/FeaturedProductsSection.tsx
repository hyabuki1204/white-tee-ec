import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Product } from "@/types";

type FeaturedProductsSectionProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
};

export function FeaturedProductsSection({
  products,
  fabricNameBySlug,
}: FeaturedProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  const { home: copy } = SITE_UI_COPY;

  return (
    <section aria-label="Selection">
      <Container as="div" className="pt-12 pb-20 sm:pt-14 sm:pb-24 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32">
        <p className="mb-14 text-[11px] font-light tracking-[0.14em] text-neutral-400 md:mb-16 md:text-[10px]">
          {copy.selection}
        </p>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-12">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                fabricName={
                  product.fabricSlug && fabricNameBySlug
                    ? fabricNameBySlug[product.fabricSlug]
                    : null
                }
                fitLabel={product.fitProfile.fitLabel}
              />
            </li>
          ))}
        </ul>

        <div className="mt-20 md:mt-24">
          <Link
            href="/products"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-500 transition-opacity duration-500 hover:opacity-50"
          >
            {copy.allPieces}
          </Link>
        </div>
      </Container>
    </section>
  );
}
