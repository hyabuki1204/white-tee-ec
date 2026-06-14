import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
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
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section className="w-full" aria-label={copy.inThisFabric}>
      <p className="mb-16 text-center text-[10px] font-light tracking-[0.16em] text-neutral-400 md:mb-20">
        {copy.inThisFabric}
      </p>

      <ProductGrid products={displayed} />

      <div className="mt-24 text-center md:mt-28">
        <Link
          href="/products"
          className="text-[11px] font-light tracking-[0.08em] text-neutral-500 transition-opacity duration-500 hover:opacity-50"
        >
          {copy.viewAll}
        </Link>
      </div>
    </section>
  );
}
