import { BrandLinksSection } from "@/components/home/BrandLinksSection";
import { CopySection } from "@/components/home/CopySection";
import { FabricEntrySection } from "@/components/home/FabricEntrySection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { getSiteContent } from "@/lib/content/queries";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";

export default async function Home() {
  const [homeContent, products, fabrics] = await Promise.all([
    getSiteContent("home"),
    getProducts(),
    getFabrics(),
  ]);

  const featured = products.slice(0, homeContent.featuredProductCount);

  return (
    <>
      <HeroSection heroImage={homeContent.heroImage} />
      <CopySection
        heroCopy={homeContent.heroCopy}
        conceptLines={homeContent.conceptLines}
      />
      <FabricEntrySection fabrics={fabrics} />
      <FeaturedProductsSection products={featured} />
      <BrandLinksSection />
    </>
  );
}
