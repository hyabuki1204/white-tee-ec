import type { Metadata } from "next";
import { ProductListingLayout } from "@/components/product/ProductListingLayout";
import { getFabricBySlug, getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  isInStockProduct,
  parseStorefrontFit,
} from "@/lib/products/silhouette";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

/**
 * Filters: `fabric` (gauge), `fit` (silhouette), `stock`.
 * Unknown values — and the retired `sleeve` param — are ignored.
 */
type ProductsPageProps = {
  searchParams: Promise<{
    fabric?: string | string[];
    fit?: string | string[];
    stock?: string | string[];
  }>;
};

const PLP_DESCRIPTION =
  "White tees in three gauges — 28G, 36G, 46G — and two silhouettes, Regular and Box.";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const fabricSlug = first(params.fabric);
  const fit = parseStorefrontFit(first(params.fit));
  const fabric = fabricSlug ? await getFabricBySlug(fabricSlug) : null;

  if (!fabric && !fit) {
    return buildPageMetadata({
      title: "Products",
      description: PLP_DESCRIPTION,
      path: "/products",
      image: "/store/plp-banner.jpg",
    });
  }

  const fitLabel = fit ? FIT_TYPE_LABELS[fit] : null;

  return buildPageMetadata({
    title: [fabric?.name, fitLabel, "Products"].filter(Boolean).join(" · "),
    description: fabric?.tagline || PLP_DESCRIPTION,
    path: buildProductsFilterHref({ fabric: fabric?.slug, fit }),
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const fabricSlug = first(params.fabric);

  const [allProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(),
  ]);

  const activeFit = parseStorefrontFit(first(params.fit));
  const inStockOnly = first(params.stock) === "in";
  const fabric = fabricSlug
    ? (fabrics.find((entry) => entry.slug === fabricSlug) ?? null)
    : null;

  let products = allProducts;

  if (fabric) {
    products = products.filter((product) => product.fabricSlug === fabric.slug);
  }

  if (activeFit) {
    products = products.filter((product) => product.fitType === activeFit);
  }

  if (inStockOnly) {
    products = products.filter(isInStockProduct);
  }

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );

  return (
    <ProductListingLayout
      products={products}
      allProducts={allProducts}
      fabrics={fabrics}
      activeFabricSlug={fabric?.slug ?? null}
      activeFit={activeFit}
      inStockOnly={inStockOnly}
      fabricNameBySlug={fabricNameBySlug}
    />
  );
}
