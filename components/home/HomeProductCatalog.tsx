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
import { getGaugeLadder } from "@/lib/fabric/gauge";
import type { Locale } from "@/lib/i18n/config";
import { formatCatalogPriceSpan } from "@/lib/products/price-range";
import type { JournalArticle } from "@/lib/content/journal-static";
import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

type HomeProductCatalogProps = {
  locale: Locale;
  products: Product[];
  fabrics: Fabric[];
  journalArticles: JournalArticle[];
  fabricNameBySlug: Record<string, string>;
};

const FEATURED_GAUGE = 46;

function buildLadder(
  products: Product[],
  fabrics: Fabric[],
  locale: Locale,
): GaugeLadderItem[] {
  return getGaugeLadder(locale).map((spec) => {
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
  locale,
  products,
  fabrics,
  journalArticles,
  fabricNameBySlug,
}: HomeProductCatalogProps) {
  const heroPriceRange = formatCatalogPriceSpan(products);
  const ladder = buildLadder(products, fabrics, locale);

  return (
    <>
      <HomeHero locale={locale} priceRange={heroPriceRange} />
      <HomeGaugeLadder items={ladder} initialGauge={FEATURED_GAUGE} />
      <HomeConcierge locale={locale} />
      <HomeProductGrid
        locale={locale}
        products={products}
        fabricNameBySlug={fabricNameBySlug}
      />
      <HomeMill locale={locale} />
      <HomeAging locale={locale} />
      <HomeJournalSection locale={locale} articles={journalArticles} />
      <HomeNewsletter />
    </>
  );
}
