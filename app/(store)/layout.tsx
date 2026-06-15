import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { SkipLink } from "@/components/layout/SkipLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFabrics } from "@/lib/fabric/queries";
import { buildStoreNavMenu } from "@/lib/navigation/store-nav";
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
  const [fabrics, products] = await Promise.all([getFabrics(), getProducts()]);
  const storeNav = buildStoreNavMenu(fabrics, products);

  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <SkipLink />
      <div className="flex min-h-screen flex-col bg-background">
        <Header storeNav={storeNav} />
        <Main>{children}</Main>
        <Footer />
      </div>
    </>
  );
}
