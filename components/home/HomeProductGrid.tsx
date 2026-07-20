import Link from "next/link";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { sortProductsByCatalogOrder } from "@/lib/products/catalog-sort";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { Product } from "@/types";

const HOME_GRID_LIMIT = 6;

type HomeProductGridProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeProductGrid({
  products,
  fabricNameBySlug,
}: HomeProductGridProps) {
  const catalogProducts = sortProductsByCatalogOrder(products).slice(
    0,
    HOME_GRID_LIMIT,
  );

  return (
    <section
      id="products"
      aria-label="Product catalog"
      className="border-t border-[var(--color-hairline)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <HomeSectionHeading
            label="PRODUCTS"
            title="コレクションから"
          />
          <Link
            href="/products"
            className="type-label text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.home.viewAllProducts}
          </Link>
        </div>

        <div className="mt-[var(--space-4)] md:mt-[var(--space-5)]">
          <ProductGrid
            products={catalogProducts}
            fabricNameBySlug={fabricNameBySlug}
          />
        </div>

        <div className="mt-[var(--space-4)] flex justify-center md:mt-[var(--space-5)]">
          <Link
            href="/products"
            className="inline-flex items-center justify-center border border-[var(--color-ink)] px-10 py-4 type-label text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
}
