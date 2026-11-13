import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductMoreFromFabric } from "@/components/fabric/ProductMoreFromFabric";
import { ProductAgingSection } from "@/components/product/ProductAgingSection";
import { ProductPageLayout } from "@/components/product/ProductPageLayout";
import { RecordProductView } from "@/components/product/RecordProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import {
  getFabricForProduct,
  getFabrics,
  getRelatedProductsForFabric,
} from "@/lib/fabric/queries";
import { getProductBySlugCached } from "@/lib/products/cached-product";
import { getAllProductSlugs, getProducts } from "@/lib/products/queries";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  /** `size` preselects a size (used by the restock email link). */
  searchParams: Promise<{ size?: string | string[] }>;
};

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugCached(slug);

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

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const { size: sizeParam } = await searchParams;
  const product = await getProductBySlugCached(slug);

  if (!product) {
    notFound();
  }

  const fabric = await getFabricForProduct(product);
  const [relatedFromFabric, fabrics, allProducts] = await Promise.all([
    fabric !== null
      ? getRelatedProductsForFabric(fabric.slug, product.slug, 3)
      : Promise.resolve([]),
    getFabrics(),
    getProducts(),
  ]);

  const relatedProducts =
    relatedFromFabric.length > 0
      ? relatedFromFabric
      : allProducts
          .filter((entry) => entry.slug !== product.slug)
          .slice(0, 3);

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );
  const displayName = getGraphpaperDisplayName(product, fabric?.name);

  const breadcrumbItems = [
    { name: "Products", path: "/products" },
    { name: displayName, path: `/products/${product.slug}` },
  ];

  const requestedSize = (
    Array.isArray(sizeParam) ? sizeParam[0] : sizeParam
  )?.toUpperCase();
  const initialSize =
    product.variants.find((variant) => variant.size === requestedSize)?.size ??
    null;

  const structuredData = [
    buildProductSchema(product),
    buildBreadcrumbSchema(breadcrumbItems),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <ProductPageLayout
        product={product}
        fabric={fabric}
        fabricName={fabric?.name}
        displayName={displayName}
        initialSize={initialSize}
      />

      <RecordProductView slug={product.slug} />

      <ProductAgingSection fabricName={fabric?.name} />

      <ProductMoreFromFabric
        products={relatedProducts}
        fabricNameBySlug={fabricNameBySlug}
      />
    </>
  );
}
