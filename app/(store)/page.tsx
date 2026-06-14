import type { Metadata } from "next";
import { BrandLinksSection } from "@/components/home/BrandLinksSection";
import { CopySection } from "@/components/home/CopySection";
import { FabricEntrySection } from "@/components/home/FabricEntrySection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { getSiteContent } from "@/lib/content/queries";
import { getFabrics } from "@/lib/fabric/queries";
import { pickFeaturedProducts } from "@/lib/home/featured-products";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSeoSettings } from "@/lib/seo/queries";

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
  const [homeContent, products, fabrics] = await Promise.all([
    getSiteContent("home"),
    getProducts(),
    getFabrics(),
  ]);

  const featured = pickFeaturedProducts(
    products,
    homeContent.featuredProductCount,
    homeContent.featuredProductSlugs,
  );
  const fabricPreview = fabrics.slice(0, homeContent.fabricPreviewCount);

  return (
    <>
      <HeroSection
        heroImage={homeContent.heroImage}
        heroCopy={homeContent.heroCopy}
      />
      <CopySection
        heroCopy={homeContent.heroCopy}
        conceptLines={homeContent.conceptLines}
      />
      <FeaturedProductsSection products={featured} />
      <FabricEntrySection
        fabrics={fabricPreview}
        introLines={homeContent.fabricIntroLines}
      />
      <BrandLinksSection />
    </>
  );
}
