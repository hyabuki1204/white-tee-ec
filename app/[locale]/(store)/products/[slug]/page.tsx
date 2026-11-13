import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
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
import { isLocale } from "@/lib/i18n/config";
import { localizeProduct, localizeProducts } from "@/lib/i18n/content-en";
import { getProductBySlugCached } from "@/lib/products/cached-product";
import { getAllProductSlugs, getProducts } from "@/lib/products/queries";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
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
  const { locale, slug } = await params;
  const stored = await getProductBySlugCached(slug);

  if (!stored || !isLocale(locale)) {
    return { title: "Not Found" };
  }

  const product = localizeProduct(stored, locale);
  const fabric = await getFabricForProduct(product, locale);
  const displayName = getGraphpaperDisplayName(product, fabric?.name);

  return buildPageMetadata({
    title: displayName,
    description: product.description,
    path: `/products/${product.slug}`,
    locale,
    image: product.imageUrl,
  });
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { locale, slug } = await params;
  const { size: sizeParam } = await searchParams;
  const stored = await getProductBySlugCached(slug);

  if (!stored || !isLocale(locale)) {
    notFound();
  }

  const product = localizeProduct(stored, locale);
  const fabric = await getFabricForProduct(product, locale);
  const [relatedFromFabric, fabrics, allProducts] = await Promise.all([
    fabric !== null
      ? getRelatedProductsForFabric(fabric.slug, product.slug, locale, 3)
      : Promise.resolve([]),
    getFabrics(locale),
    getProducts().then((products) => localizeProducts(products, locale)),
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
    { name: getStoreCopy(locale).nav.products, path: "/products" },
    { name: displayName, path: `/products/${product.slug}` },
  ];

  const requestedSize = (
    Array.isArray(sizeParam) ? sizeParam[0] : sizeParam
  )?.toUpperCase();
  const initialSize =
    product.variants.find((variant) => variant.size === requestedSize)?.size ??
    null;

  const structuredData = [
    buildProductSchema(product, locale),
    buildBreadcrumbSchema(breadcrumbItems, locale),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <ProductPageLayout
        locale={locale}
        product={product}
        fabric={fabric}
        fabricName={fabric?.name}
        displayName={displayName}
        initialSize={initialSize}
      />

      <RecordProductView slug={product.slug} />

      <ProductAgingSection locale={locale} fabricName={fabric?.name} />

      <ProductMoreFromFabric
        locale={locale}
        products={relatedProducts}
        fabricNameBySlug={fabricNameBySlug}
      />
    </>
  );
}
