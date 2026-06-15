import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductFabricLink } from "@/components/fabric/ProductFabricLink";
import { ProductMoreFromFabric } from "@/components/fabric/ProductMoreFromFabric";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import {
  getFabricForProduct,
  getFabrics,
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
  const [relatedProducts, fabrics] = await Promise.all([
    fabric !== null
      ? getRelatedProductsForFabric(fabric.slug, product.slug)
      : Promise.resolve([]),
    getFabrics(),
  ]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );

  const breadcrumbItems = fabric
    ? [
        { name: "Home", path: "/" },
        { name: fabric.name, path: `/fabric/${fabric.slug}` },
        { name: product.name, path: `/products/${product.slug}` },
      ]
    : [
        { name: "Home", path: "/" },
        { name: product.name, path: `/products/${product.slug}` },
      ];

  const structuredData = [
    buildProductSchema(product),
    buildBreadcrumbSchema(breadcrumbItems),
  ];

  const { breadcrumbs: bc } = SITE_UI_COPY;
  const uiBreadcrumbs = fabric
    ? [
        { label: bc.home, href: "/" },
        { label: fabric.name, href: `/fabric/${fabric.slug}` },
        { label: product.name },
      ]
    : [
        { label: bc.home, href: "/" },
        { label: product.name },
      ];

  return (
    <>
      <JsonLd data={structuredData} />
      <Container as="div" className="px-6 pt-6 lg:hidden">
        <Breadcrumbs items={uiBreadcrumbs} />
      </Container>
      <section className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)] lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,0.85fr)] xl:gap-x-16">
        <ProductGallery product={product} />
        <div>
          <Container as="div" className="hidden px-6 pt-6 lg:block xl:px-10">
            <Breadcrumbs items={uiBreadcrumbs} />
          </Container>
          <ProductInfo product={product} fabric={fabric} />
        </div>
      </section>

      {fabric !== null ? (
        <>
          <ProductFabricLink fabric={fabric} />
          <ProductMoreFromFabric
            products={relatedProducts}
            fabricNameBySlug={fabricNameBySlug}
          />
        </>
      ) : null}
    </>
  );
}
