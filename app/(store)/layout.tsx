import type { Metadata } from "next";
import { SkipLink } from "@/components/layout/SkipLink";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { buildOrganizationSchema } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSeoSettings } from "@/lib/seo/queries";
import { getSiteUrl } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  return {
    metadataBase: new URL(getSiteUrl()),
    ...buildPageMetadata({
      title: seo.siteName,
      description: seo.siteDescription,
      path: "/",
      image: seo.defaultOgpImage,
    }),
  };
}

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(),
  ]);
  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <SkipLink />
      <div className="flex min-h-screen flex-col bg-background">
        <StoreChrome
          products={products}
          fabricNameBySlug={fabricNameBySlug}
        >
          {children}
        </StoreChrome>
      </div>
    </>
  );
}
