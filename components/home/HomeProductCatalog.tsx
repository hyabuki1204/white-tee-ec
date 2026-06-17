import { Suspense } from "react";
import { HomeFabricSection } from "@/components/home/HomeFabricSection";
import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { HomeJournalSection } from "@/components/home/HomeJournalSection";
import { HomeProductGridWithSleeveToggle } from "@/components/home/HomeProductGridWithSleeveToggle";
import { sortProductsByCatalogOrder } from "@/lib/products/catalog-sort";
import type { Fabric } from "@/lib/fabric/content";
import type { JournalArticle } from "@/lib/content/journal";
import type { Product } from "@/types";

type HomeProductCatalogProps = {
  products: Product[];
  fabrics: Fabric[];
  journalArticles: JournalArticle[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeProductCatalog({
  products,
  fabrics,
  journalArticles,
  fabricNameBySlug,
}: HomeProductCatalogProps) {
  const catalogProducts = sortProductsByCatalogOrder(products);

  return (
    <>
      <section aria-label="Product catalog" className="pb-16 md:pb-24">
        <HomeHeroCarousel />

        <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
          <Suspense fallback={null}>
            <HomeProductGridWithSleeveToggle
              products={catalogProducts}
              fabricNameBySlug={fabricNameBySlug}
            />
          </Suspense>
        </div>
      </section>

      <HomeFabricSection fabrics={fabrics} />
      <HomeJournalSection articles={journalArticles} />
    </>
  );
}
