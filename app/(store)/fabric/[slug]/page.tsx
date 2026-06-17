import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FabricDetailIntro } from "@/components/fabric/FabricDetailIntro";
import { FabricHero } from "@/components/fabric/FabricHero";
import { FabricRelatedProducts } from "@/components/fabric/FabricRelatedProducts";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import {
  getFabricBySlug,
  getFabricSlugs,
  getFabrics,
  getProductsForFabric,
} from "@/lib/fabric/queries";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type FabricPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getFabricSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: FabricPageProps): Promise<Metadata> {
  const { slug } = await params;
  const fabric = await getFabricBySlug(slug);

  if (!fabric) {
    return { title: "Not Found" };
  }

  const description = fabric.descriptionLines.join(" ");

  return buildPageMetadata({
    title: `${fabric.name} · Fabric`,
    description,
    path: `/fabric/${fabric.slug}`,
    image: fabric.imageUrl,
  });
}

export default async function FabricDetailPage({ params }: FabricPageProps) {
  const { slug } = await params;
  const fabric = await getFabricBySlug(slug);

  if (!fabric) {
    notFound();
  }

  const [products, fabrics] = await Promise.all([
    getProductsForFabric(fabric.slug),
    getFabrics(),
  ]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Fabric", path: "/fabric" },
    { name: fabric.name, path: `/fabric/${fabric.slug}` },
  ]);

  const { breadcrumbs: bc } = SITE_UI_COPY;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <FabricHero fabric={fabric} />

      <Container as="section" className="py-12 sm:py-16 md:py-20">
        <Breadcrumbs
          items={[
            { label: bc.home, href: "/" },
            { label: bc.fabric, href: "/fabric" },
            { label: fabric.name },
          ]}
          className="mx-auto max-w-6xl"
        />

        <div className="mx-auto mt-10 max-w-6xl md:mt-12">
          <FabricDetailIntro fabric={fabric} />
        </div>

        <div className="mx-auto mt-16 max-w-6xl sm:mt-20 md:mt-24">
          <FabricRelatedProducts
            products={products}
            fabricSlug={fabric.slug}
            fabricNameBySlug={fabricNameBySlug}
          />
        </div>
      </Container>
    </>
  );
}
