import type { Metadata } from "next";
import { HomeProductCatalog } from "@/components/home/HomeProductCatalog";
import { getFeaturedJournalArticles } from "@/lib/content/journal";
import { getFabrics } from "@/lib/fabric/queries";
import { localizeProducts } from "@/lib/i18n/content-en";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/server";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSeoSettings } from "@/lib/seo/queries";

export const dynamic = "force-dynamic";

type HomePageProps = {
  params: Promise<LocaleParams>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const seo = await getSeoSettings();

  return buildPageMetadata({
    title: seo.siteName,
    description: seo.siteDescription,
    path: "/",
    locale,
    image: seo.defaultOgpImage,
  });
}

export default async function Home({ params }: HomePageProps) {
  const locale = await resolveLocale(params);
  const [allProducts, fabrics, journalArticles] = await Promise.all([
    getProducts(),
    getFabrics(locale),
    getFeaturedJournalArticles(locale, 2),
  ]);
  const products = localizeProducts(allProducts, locale);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  return (
    <HomeProductCatalog
      locale={locale}
      products={products}
      fabrics={fabrics}
      journalArticles={journalArticles}
      fabricNameBySlug={fabricNameBySlug}
    />
  );
}
