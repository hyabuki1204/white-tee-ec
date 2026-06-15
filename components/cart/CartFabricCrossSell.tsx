import { ProductCard } from "@/components/product/ProductCard";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
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

  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section
      aria-label={copy.inThisFabric}
      className="mt-16 border-t border-neutral-200/60 pt-12 md:mt-20 md:pt-16"
    >
      <p className="mb-8 text-[11px] font-light tracking-[0.12em] text-neutral-400 md:text-[10px]">
        {copy.inThisFabric}
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
              fitLabel={product.fitProfile.fitLabel}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
