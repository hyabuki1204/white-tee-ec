import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FabricDetailIntro } from "@/components/fabric/FabricDetailIntro";
import { FabricHero } from "@/components/fabric/FabricHero";
import { FabricRelatedProducts } from "@/components/fabric/FabricRelatedProducts";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import {
  getFabricBySlug,
  getFabricSlugs,
  getFabrics,
  getProductsForFabric,
} from "@/lib/fabric/queries";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * The catalog lives in the database and changes without a deploy (admin
 * edits, and migrations that run after the build). Re-read it periodically
 * instead of freezing whatever the database held at build time.
 */
export const revalidate = 300;

type FabricPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getFabricSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: FabricPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const fabric = isLocale(locale) ? await getFabricBySlug(slug, locale) : null;

  if (!fabric || !isLocale(locale)) {
    return { title: "Not Found" };
  }

  const description = fabric.descriptionLines.join(" ");

  return buildPageMetadata({
    title: `${fabric.name} · ${locale === "en" ? "Gauge" : "Fabric"}`,
    description,
    path: `/fabric/${fabric.slug}`,
    locale,
    image: fabric.imageUrl,
  });
}

export default async function FabricDetailPage({ params }: FabricPageProps) {
  const { locale, slug } = await params;
  const fabric = isLocale(locale) ? await getFabricBySlug(slug, locale) : null;

  if (!fabric || !isLocale(locale)) {
    notFound();
  }

  const [products, fabrics] = await Promise.all([
    getProductsForFabric(fabric.slug, locale),
    getFabrics(locale),
  ]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );

  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { name: "Home", path: "/" },
      { name: "Fabric", path: "/fabric" },
      { name: fabric.name, path: `/fabric/${fabric.slug}` },
    ],
    locale,
  );

  const { breadcrumbs: bc } = getSiteUiCopy(locale);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <FabricHero locale={locale} fabric={fabric} />

      <Container as="section" className="py-12 sm:py-16 md:py-20">
        <Breadcrumbs
          items={[
            { label: bc.home, href: "/" },
            { label: bc.fabric, href: "/fabric" },
            { label: fabric.name },
          ]}
          className="mx-auto max-w-6xl"
        />

        {/* A short English note for the Japanese page. On the English page
            the hero above already says it, so it is not repeated. */}
        {locale === "ja" ? (
          <div className="mx-auto mt-10 max-w-6xl md:mt-12">
            <FabricDetailIntro fabric={fabric} />
          </div>
        ) : null}

        <div className="mx-auto mt-16 max-w-6xl sm:mt-20 md:mt-24">
          <FabricRelatedProducts
            locale={locale}
            products={products}
            fabricSlug={fabric.slug}
            fabricNameBySlug={fabricNameBySlug}
          />
        </div>
      </Container>
    </>
  );
}
