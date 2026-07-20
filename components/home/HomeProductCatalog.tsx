import { HomeCredibility } from "@/components/home/HomeCredibility";
import { HomeCta } from "@/components/home/HomeCta";
import { HomeFeaturedProduct } from "@/components/home/HomeFeaturedProduct";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePriceContext } from "@/components/home/HomePriceContext";
import { HomeProductGrid } from "@/components/home/HomeProductGrid";
import { HomeStory } from "@/components/home/HomeStory";
import { formatCatalogPriceRange } from "@/lib/products/price-range";
import { sortProductsByCatalogOrder } from "@/lib/products/catalog-sort";
import {
  buildHomeDetailContent,
  findHomeFeaturedProduct,
} from "@/lib/store-ui/home-featured";
import { isSleeveType } from "@/lib/products/silhouette";
import type { Fabric } from "@/lib/fabric/content";
import type { SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";

type HomeProductCatalogProps = {
  products: Product[];
  fabrics: Fabric[];
  fabricNameBySlug: Record<string, string>;
  activeSleeve?: SleeveType;
};

export function HomeProductCatalog({
  products,
  fabrics,
  fabricNameBySlug,
  activeSleeve = "short",
}: HomeProductCatalogProps) {
  const catalogProducts = sortProductsByCatalogOrder(products);
  const priceRange = formatCatalogPriceRange(catalogProducts);
  const sleeve = isSleeveType(activeSleeve) ? activeSleeve : "short";
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
      <HomeHero priceRange={priceRange} />

      <HomeFeaturedProduct
        products={catalogProducts}
        fabricNameBySlug={fabricNameBySlug}
      />

      <section
        id="products"
        aria-label="Product catalog"
        className="border-t border-[#e8e8e6] pb-20 pt-8 md:pb-32 md:pt-12"
      >
        <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
          <HomeProductGrid
            products={catalogProducts}
            fabricNameBySlug={fabricNameBySlug}
            activeSleeve={sleeve}
          />
        </div>
      </section>

      <HomeStory />
      <HomeCredibility />
      <HomePriceContext priceRange={priceRange} />
      {featuredDetail ? <HomeCta productHref={featuredDetail.productHref} /> : null}
    </>
  );
}
