import { Suspense } from "react";
import { HomeCredibility } from "@/components/home/HomeCredibility";
import { HomeCta } from "@/components/home/HomeCta";
import { HomeDetail } from "@/components/home/HomeDetail";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePriceContext } from "@/components/home/HomePriceContext";
import { HomeProductGridWithSleeveToggle } from "@/components/home/HomeProductGridWithSleeveToggle";
import { HomeProof } from "@/components/home/HomeProof";
import { HomeStory } from "@/components/home/HomeStory";
import type { Fabric } from "@/lib/fabric/content";
import {
  buildHomeDetailContent,
  findHomeFeaturedProduct,
} from "@/lib/store-ui/home-featured";
import { sortProductsByCatalogOrder } from "@/lib/products/catalog-sort";
import type { Product } from "@/types";

type HomeProductCatalogProps = {
  products: Product[];
  fabrics: Fabric[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeProductCatalog({
  products,
  fabrics,
  fabricNameBySlug,
}: HomeProductCatalogProps) {
  const catalogProducts = sortProductsByCatalogOrder(products);
  const featuredProduct = findHomeFeaturedProduct(catalogProducts);
  const featuredFabric = featuredProduct?.fabricSlug
    ? fabrics.find((fabric) => fabric.slug === featuredProduct.fabricSlug) ?? null
    : null;
  const featuredDetail = featuredProduct
    ? buildHomeDetailContent(
        featuredProduct,
        featuredFabric,
        featuredProduct.fabricSlug
          ? fabricNameBySlug[featuredProduct.fabricSlug]
          : null,
      )
    : null;

  return (
    <>
      <HomeHero />

      <HomeProof />

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

      {featuredDetail ? <HomeDetail detail={featuredDetail} /> : null}
      <HomeStory />
      <HomeCredibility />
      <HomePriceContext />
      {featuredDetail ? <HomeCta productHref={featuredDetail.productHref} /> : null}
    </>
  );
}
