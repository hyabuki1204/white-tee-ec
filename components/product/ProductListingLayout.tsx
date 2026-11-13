import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFiltersSidebar } from "@/components/product/ProductFiltersSidebar";
import type { Fabric } from "@/lib/fabric/content";
import type { Locale } from "@/lib/i18n/config";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import type { FitType } from "@/types/product-fit";
import type { Product } from "@/types";

type ProductListingLayoutProps = {
  locale: Locale;
  products: Product[];
  allProducts: Product[];
  fabrics: Fabric[];
  activeFabricSlug?: string | null;
  activeFit?: FitType | null;
  inStockOnly?: boolean;
  fabricNameBySlug: Record<string, string>;
  title?: string;
};

export function ProductListingLayout({
  locale,
  products,
  allProducts,
  fabrics,
  activeFabricSlug,
  activeFit,
  inStockOnly = false,
  fabricNameBySlug,
  title,
}: ProductListingLayoutProps) {
  const copy = getStoreCopy(locale);

  return (
    <>
      <header className="border-b border-[var(--color-hairline)] bg-[var(--color-surface)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-8 md:py-16 lg:px-12">
          <div>
            <p className="type-label !text-[var(--color-navy)]">
              {copy.nav.products}
            </p>
            <h1 className="type-display mt-3">{title ?? copy.plp.title}</h1>
          </div>
          <p className="type-body max-w-[26em] text-[var(--color-ink-soft)]">
            {copy.plp.lead}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex flex-col gap-10 py-10 md:py-14 lg:flex-row lg:gap-16 lg:py-16">
          <ProductFiltersSidebar
            locale={locale}
            fabrics={fabrics}
            products={allProducts}
            activeFabricSlug={activeFabricSlug}
            activeFit={activeFit}
            inStockOnly={inStockOnly}
          />

          <div className="min-w-0 flex-1">
            <p className="type-label mb-8 tabular-nums">
              {copy.plp.items(products.length)}
            </p>

            <ProductGrid
              products={products}
              fabricNameBySlug={fabricNameBySlug}
            />
          </div>
        </div>
      </div>
    </>
  );
}
