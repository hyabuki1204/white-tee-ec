import { ProductCard } from "@/components/product/ProductCard";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { Product } from "@/types";

type CartFabricCrossSellProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
};

export function CartFabricCrossSell({
  products,
  fabricNameBySlug,
}: CartFabricCrossSellProps) {
  if (products.length === 0) {
    return null;
  }

  const copy = GRAPHPAPER_STORE_COPY.cart;

  return (
    <section
      aria-label={copy.pairWith}
      className="mt-16 border-t border-neutral-200/60 pt-12 md:mt-20 md:pt-16"
    >
      <p className="mb-8 text-[12px] font-normal tracking-[0.12em] text-neutral-600 md:text-[12px]">
        {copy.pairWith}
      </p>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
