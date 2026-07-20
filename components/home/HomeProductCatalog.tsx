import { HomeAging } from "@/components/home/HomeAging";
import { HomeFabricIntro } from "@/components/home/HomeFabricIntro";
import { HomeFeaturedProduct } from "@/components/home/HomeFeaturedProduct";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeJournalSection } from "@/components/home/HomeJournalSection";
import { HomeNewsletter } from "@/components/home/HomeNewsletter";
import { HomeProductGrid } from "@/components/home/HomeProductGrid";
import { formatCatalogPriceSpan } from "@/lib/products/price-range";
import type { JournalArticle } from "@/lib/content/journal-static";
import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

type HomeProductCatalogProps = {
  products: Product[];
  fabrics: Fabric[];
  journalArticles: JournalArticle[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeProductCatalog({
  products,
  journalArticles,
  fabricNameBySlug,
}: HomeProductCatalogProps) {
  const heroPriceRange = formatCatalogPriceSpan(products);

  return (
    <>
      <HomeHero priceRange={heroPriceRange} />
      <HomeFeaturedProduct
        products={products}
        fabricNameBySlug={fabricNameBySlug}
      />
      <HomeProductGrid
        products={products}
        fabricNameBySlug={fabricNameBySlug}
      />
      <HomeFabricIntro />
      <HomeAging />
      <HomeJournalSection articles={journalArticles} />
      <HomeNewsletter />
    </>
  );
}
