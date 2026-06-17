import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductMoreFromFabric } from "@/components/fabric/ProductMoreFromFabric";
import { ProductPageLayout } from "@/components/product/ProductPageLayout";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { RecordProductView } from "@/components/product/RecordProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import {
  getFabricForProduct,
  getFabrics,
  getRelatedProductsForFabric,
} from "@/lib/fabric/queries";
import {
  getAllProductSlugs,
  getProductBySlug,
  getProducts,
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

  const fabric = await getFabricForProduct(product);
  const displayName = getGraphpaperDisplayName(product, fabric?.name);

  return buildPageMetadata({
    title: displayName,
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
  const [relatedProducts, fabrics, allProducts] = await Promise.all([
    fabric !== null
      ? getRelatedProductsForFabric(fabric.slug, product.slug)
      : Promise.resolve([]),
    getFabrics(),
    getProducts(),
  ]);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );
  const displayName = getGraphpaperDisplayName(product, fabric?.name);

  const breadcrumbItems = fabric
    ? [
        { name: "Home", path: "/" },
        { name: fabric.name, path: `/fabric/${fabric.slug}` },
        { name: displayName, path: `/products/${product.slug}` },
      ]
    : [
        { name: "Home", path: "/" },
        { name: displayName, path: `/products/${product.slug}` },
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
        { label: displayName },
      ]
    : [
        { label: bc.home, href: "/" },
        { label: displayName },
      ];

  return (
    <>
      <JsonLd data={structuredData} />
      <Container as="div" className="px-6 pt-6 lg:hidden">
        <Breadcrumbs items={uiBreadcrumbs} />
      </Container>
      <Container as="div" className="hidden px-6 pt-6 lg:block xl:px-10">
        <Breadcrumbs items={uiBreadcrumbs} />
      </Container>

      <ProductPageLayout
        product={product}
        fabric={fabric}
        fabricName={fabric?.name}
        displayName={displayName}
      />

      <RecordProductView slug={product.slug} />

      {fabric !== null ? (
        <ProductMoreFromFabric
          products={relatedProducts}
          fabricNameBySlug={fabricNameBySlug}
        />
      ) : null}

      <RecentlyViewed
        currentSlug={product.slug}
        allProducts={allProducts}
        fabricNameBySlug={fabricNameBySlug}
      />
    </>
  );
}
