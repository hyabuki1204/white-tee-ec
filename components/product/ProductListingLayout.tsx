import Image from "next/image";
import { PlpSleeveToggle } from "@/components/product/PlpSleeveToggle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFiltersSidebar } from "@/components/product/ProductFiltersSidebar";
import type { Fabric } from "@/lib/fabric/content";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { FitType, SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";

type ProductListingLayoutProps = {
  products: Product[];
  allProducts: Product[];
  fabrics: Fabric[];
  activeFabricSlug?: string | null;
  activeSleeve: SleeveType | null;
  activeFit?: FitType | null;
  inStockOnly?: boolean;
  fabricNameBySlug: Record<string, string>;
  title?: string;
};

export function ProductListingLayout({
  products,
  allProducts,
  fabrics,
  activeFabricSlug,
  activeSleeve,
  activeFit,
  inStockOnly = false,
  fabricNameBySlug,
  title = GRAPHPAPER_STORE_COPY.plp.title,
}: ProductListingLayoutProps) {
  return (
    <>
      <div className="relative aspect-[21/9] max-h-[28vh] w-full overflow-hidden bg-[var(--color-image-placeholder)] sm:max-h-[32vh] md:max-h-[36vh]">
        <Image
          src="/store/plp-banner.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%] opacity-95"
        />
        <div className="absolute inset-0 bg-[var(--color-bg)]/70" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex flex-col gap-10 py-10 md:py-14 lg:flex-row lg:gap-16 lg:py-16">
          <ProductFiltersSidebar
            fabrics={fabrics}
            products={allProducts}
            activeFabricSlug={activeFabricSlug}
            activeSleeve={activeSleeve}
            inStockOnly={inStockOnly}
          />

          <div className="min-w-0 flex-1">
            <header className="mb-10">
              <h1 className="type-label">{title}</h1>
              <p className="type-label mt-3 text-[var(--color-ink)]">
                {GRAPHPAPER_STORE_COPY.plp.items(products.length)}
              </p>

              <div className="mt-6">
                <PlpSleeveToggle
                  activeSleeve={activeSleeve}
                  activeFabricSlug={activeFabricSlug}
                  activeFit={activeFit}
                  inStockOnly={inStockOnly}
                />
              </div>
            </header>

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
