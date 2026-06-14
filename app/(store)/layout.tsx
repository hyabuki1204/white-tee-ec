import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { SkipLink } from "@/components/layout/SkipLink";
import { JsonLd } from "@/components/seo/JsonLd";
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

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <SkipLink />
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <Main>{children}</Main>
        <Footer />
      </div>
    </>
  );
}
