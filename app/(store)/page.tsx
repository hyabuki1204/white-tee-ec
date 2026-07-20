import type { Metadata } from "next";
import { HomeProductCatalog } from "@/components/home/HomeProductCatalog";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { isSleeveType } from "@/lib/products/silhouette";
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

type HomePageProps = {
  searchParams: Promise<{ sleeve?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { sleeve: sleeveParam } = await searchParams;
  const activeSleeve = isSleeveType(sleeveParam) ? sleeveParam : "short";

  const [products, fabrics] = await Promise.all([getProducts(), getFabrics()]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  return (
    <HomeProductCatalog
      products={products}
      fabrics={fabrics}
      fabricNameBySlug={fabricNameBySlug}
      activeSleeve={activeSleeve}
    />
  );
}
