import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductFabricLink } from "@/components/fabric/ProductFabricLink";
import { ProductMoreFromFabric } from "@/components/fabric/ProductMoreFromFabric";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import {
  getFabricForProduct,
  getRelatedProductsForFabric,
} from "@/lib/fabric/queries";
import {
  getAllProductSlugs,
  getProductBySlug,
} from "@/lib/products/queries";
import { getSiteUrl } from "@/lib/seo/site";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Not Found" };
  }

  const title = product.name;
  const description = product.description;
  const imageUrl = product.imageUrl.startsWith("http")
    ? product.imageUrl
    : `${getSiteUrl()}${product.imageUrl}`;

  return {
    title: `${product.name} | WHITE TEE`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: imageUrl, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const fabric = await getFabricForProduct(product);
  const relatedProducts =
    fabric !== null
      ? await getRelatedProductsForFabric(fabric.slug, product.slug)
      : [];

  return (
    <>
      <section className="lg:grid lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:items-start lg:gap-x-16 xl:gap-x-24">
        <ProductGallery product={product} />
        <ProductInfo product={product} />
      </section>

      {fabric !== null ? (
        <>
          <ProductFabricLink fabric={fabric} />
          <ProductMoreFromFabric products={relatedProducts} />
        </>
      ) : null}
    </>
  );
}
