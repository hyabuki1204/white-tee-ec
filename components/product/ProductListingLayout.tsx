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
  activeSleeve: SleeveType;
  activeFit?: FitType | null;
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
  fabricNameBySlug,
  title = GRAPHPAPER_STORE_COPY.plp.title,
}: ProductListingLayoutProps) {
  return (
    <>
      <div className="relative aspect-[21/9] max-h-[28vh] w-full overflow-hidden bg-[#ececea] sm:max-h-[32vh] md:max-h-[36vh]">
        <Image
          src="/store/plp-banner.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%] opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex flex-col gap-10 py-10 md:py-14 lg:flex-row lg:gap-16 lg:py-16">
          <ProductFiltersSidebar
            fabrics={fabrics}
            products={allProducts}
            activeFabricSlug={activeFabricSlug}
            activeSleeve={activeSleeve}
            activeFit={activeFit}
          />

          <div className="min-w-0 flex-1">
            <header className="mb-8 flex flex-col gap-6 border-b border-neutral-200/70 pb-6 sm:flex-row sm:items-end sm:justify-between md:mb-10">
              <div>
                <h1 className="text-[13px] font-light tracking-[0.28em] text-neutral-800">
                  {title}
                </h1>
                <p className="mt-3 text-[11px] font-light tracking-[0.08em] text-neutral-400">
                  {GRAPHPAPER_STORE_COPY.plp.items(products.length)}
                </p>
              </div>

              <PlpSleeveToggle
                activeSleeve={activeSleeve}
                activeFabricSlug={activeFabricSlug}
                activeFit={activeFit}
              />
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
