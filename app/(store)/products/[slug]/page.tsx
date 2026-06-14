import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductFabricLink } from "@/components/fabric/ProductFabricLink";
import { ProductMoreFromFabric } from "@/components/fabric/ProductMoreFromFabric";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getFabricForProduct,
  getRelatedProductsForFabric,
} from "@/lib/fabric/queries";
import {
  getAllProductSlugs,
  getProductBySlug,
} from "@/lib/products/queries";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

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

  return buildPageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
    image: product.imageUrl,
  });
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

  const structuredData = [
    buildProductSchema(product),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: product.name, path: `/products/${product.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <section className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)] lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,0.85fr)] xl:gap-x-16">
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
