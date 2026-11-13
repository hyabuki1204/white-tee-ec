import { HomeAging } from "@/components/home/HomeAging";
import { HomeConcierge } from "@/components/home/HomeConcierge";
import {
  HomeGaugeLadder,
  type GaugeLadderItem,
} from "@/components/home/HomeGaugeLadder";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeJournalSection } from "@/components/home/HomeJournalSection";
import { HomeMill } from "@/components/home/HomeMill";
import { HomeNewsletter } from "@/components/home/HomeNewsletter";
import { HomeProductGrid } from "@/components/home/HomeProductGrid";
import { GAUGE_LADDER } from "@/lib/fabric/gauge";
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

const FEATURED_GAUGE = 46;

function buildLadder(products: Product[], fabrics: Fabric[]): GaugeLadderItem[] {
  return GAUGE_LADDER.map((spec) => {
    const fabric = fabrics.find((item) => item.slug === spec.fabricSlug);
    const pieces = products
      .filter((product) => product.fabricSlug === spec.fabricSlug)
      .sort((a, b) => Number(a.fitType === "boxy") - Number(b.fitType === "boxy"))
      .map((product) => ({
        slug: product.slug,
        label: product.fitType === "boxy" ? "Box" : "Regular",
        price: product.price,
      }));

    return {
      ...spec,
      imageUrl: fabric?.imageUrl ?? `/fabric/${spec.fabricSlug}.jpg`,
      pieces,
    };
  }).filter((item) => item.pieces.length > 0);
}

export function HomeProductCatalog({
  products,
  fabrics,
  journalArticles,
  fabricNameBySlug,
}: HomeProductCatalogProps) {
  const heroPriceRange = formatCatalogPriceSpan(products);
  const ladder = buildLadder(products, fabrics);

  return (
    <>
      <HomeHero priceRange={heroPriceRange} />
      <HomeGaugeLadder items={ladder} initialGauge={FEATURED_GAUGE} />
      <HomeConcierge />
      <HomeProductGrid
        products={products}
        fabricNameBySlug={fabricNameBySlug}
      />
      <HomeMill />
      <HomeAging />
      <HomeJournalSection articles={journalArticles} />
      <HomeNewsletter />
    </>
  );
}
