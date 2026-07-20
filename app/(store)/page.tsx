import type { Metadata } from "next";
import { HomeProductCatalog } from "@/components/home/HomeProductCatalog";
import { getFeaturedJournalArticles } from "@/lib/content/journal";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSeoSettings } from "@/lib/seo/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  return buildPageMetadata({
    title: seo.siteName,
    description: seo.siteDescription,
    path: "/",
    image: seo.defaultOgpImage,
  });
}

export default async function Home() {
  const [products, fabrics, journalArticles] = await Promise.all([
    getProducts(),
    getFabrics(),
    getFeaturedJournalArticles(2),
  ]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  return (
    <HomeProductCatalog
      products={products}
      fabrics={fabrics}
      journalArticles={journalArticles}
      fabricNameBySlug={fabricNameBySlug}
    />
  );
}
