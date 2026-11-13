import { Link } from "@/components/i18n/Link";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { sortProductsByCatalogOrder } from "@/lib/products/catalog-sort";
import type { Locale } from "@/lib/i18n/config";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import type { Product } from "@/types";

const HOME_GRID_LIMIT = 6;

type HomeProductGridProps = {
  locale: Locale;
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeProductGrid({
  locale,
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
      className="bg-[var(--color-ground)] pb-[var(--space-6)] pt-[var(--space-5)] md:pb-[var(--space-7)] md:pt-[var(--space-6)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <HomeSectionHeading
            label="Collection"
            title={
              locale === "en"
                ? "Three gauges, two silhouettes."
                : "3つのゲージ、2つのシルエット。"
            }
          />
          <Link
            href="/products"
            className="type-label text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
          >
            {getStoreCopy(locale).home.viewAllProducts}
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
