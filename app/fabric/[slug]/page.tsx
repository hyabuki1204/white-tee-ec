import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FabricDetailIntro } from "@/components/fabric/FabricDetailIntro";
import { FabricHero } from "@/components/fabric/FabricHero";
import { FabricRelatedProducts } from "@/components/fabric/FabricRelatedProducts";
import { Container } from "@/components/layout/Container";
import {
  getFabricBySlug,
  getFabricSlugs,
  getProductsForFabric,
} from "@/lib/fabric/queries";
import { getSiteUrl } from "@/lib/seo/site";

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
  const imageUrl = `${getSiteUrl()}${fabric.imageUrl}`;

  return {
    title: `${fabric.name} | Fabric | WHITE TEE`,
    description,
    openGraph: {
      title: fabric.name,
      description: fabric.tagline,
      type: "website",
      images: [{ url: imageUrl, alt: fabric.imageAlt }],
    },
  };
}

export default async function FabricDetailPage({ params }: FabricPageProps) {
  const { slug } = await params;
  const fabric = await getFabricBySlug(slug);

  if (!fabric) {
    notFound();
  }

  const products = await getProductsForFabric(fabric.slug);

  return (
    <>
      <FabricHero fabric={fabric} />

      <Container as="section" className="py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-2xl">
          <FabricDetailIntro fabric={fabric} />
        </div>

        <div className="mx-auto mt-24 max-w-5xl md:mt-32 lg:mt-40">
          <FabricRelatedProducts products={products} />
        </div>
      </Container>
    </>
  );
}
