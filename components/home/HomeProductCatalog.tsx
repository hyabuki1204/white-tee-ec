import { Suspense } from "react";
import { HomeCta } from "@/components/home/HomeCta";
import { HomeDetail } from "@/components/home/HomeDetail";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeProductGridWithSleeveToggle } from "@/components/home/HomeProductGridWithSleeveToggle";
import { HomeProof } from "@/components/home/HomeProof";
import { HomeStory } from "@/components/home/HomeStory";
import { sortProductsByCatalogOrder } from "@/lib/products/catalog-sort";
import type { Product } from "@/types";

type HomeProductCatalogProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeProductCatalog({
  products,
  fabricNameBySlug,
}: HomeProductCatalogProps) {
  const catalogProducts = sortProductsByCatalogOrder(products);

  return (
    <>
      <HomeHero />

      <section
        id="products"
        aria-label="Product catalog"
        className="border-t border-[#e8e8e6] pb-20 pt-8 md:pb-32 md:pt-12"
      >
        <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
          <Suspense fallback={null}>
            <HomeProductGridWithSleeveToggle
              products={catalogProducts}
              fabricNameBySlug={fabricNameBySlug}
            />
          </Suspense>
        </div>
      </section>

      <HomeProof />
      <HomeDetail />
      <HomeStory />
      <HomeCta />
    </>
  );
}
