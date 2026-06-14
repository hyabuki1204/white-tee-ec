import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FabricDetailIntro } from "@/components/fabric/FabricDetailIntro";
import { FabricHero } from "@/components/fabric/FabricHero";
import { FabricRelatedProducts } from "@/components/fabric/FabricRelatedProducts";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getFabricBySlug,
  getFabricSlugs,
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

  const products = await getProductsForFabric(fabric.slug);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Fabric", path: "/fabric" },
    { name: fabric.name, path: `/fabric/${fabric.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <FabricHero fabric={fabric} />

      <Container as="section" className="py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <FabricDetailIntro fabric={fabric} />
        </div>

        <div className="mx-auto mt-20 max-w-5xl sm:mt-28 md:mt-36 lg:mt-44">
          <FabricRelatedProducts products={products} />
        </div>
      </Container>
    </>
  );
}
