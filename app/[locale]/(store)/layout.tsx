import type { Metadata } from "next";
import { SkipLink } from "@/components/layout/SkipLink";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { localizeProducts } from "@/lib/i18n/content-en";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/server";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSeoSettings } from "@/lib/seo/queries";
import { getSiteUrl } from "@/lib/seo/site";

type StoreLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<LocaleParams>;
}>;

export async function generateMetadata({
  params,
}: Pick<StoreLayoutProps, "params">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const seo = await getSeoSettings();

  return {
    metadataBase: new URL(getSiteUrl()),
    ...buildPageMetadata({
      title: seo.siteName,
      description: seo.siteDescription,
      path: "/",
      locale,
      image: seo.defaultOgpImage,
    }),
  };
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const locale = await resolveLocale(params);
  const [allProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(locale),
  ]);
  const products = localizeProducts(allProducts, locale);
  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  return (
    <>
      <JsonLd
        data={[buildOrganizationSchema(locale), buildWebSiteSchema(locale)]}
      />
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
