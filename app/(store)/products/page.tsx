import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductListingLayout } from "@/components/product/ProductListingLayout";
import { getFabricBySlug, getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  isFitType,
  isInStockProduct,
  isSleeveType,
  SLEEVE_TYPE_LABELS,
} from "@/lib/products/silhouette";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProductsPageProps = {
  searchParams: Promise<{
    fabric?: string;
    sleeve?: string;
    fit?: string;
    stock?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { fabric: fabricSlug, sleeve, fit } = await searchParams;

  if (fabricSlug) {
    const fabric = await getFabricBySlug(fabricSlug);

    if (fabric) {
      return buildPageMetadata({
        title: `${fabric.name} · TOPS`,
        description: fabric.tagline,
        path: `/products?fabric=${fabric.slug}`,
      });
    }
  }

  if (isSleeveType(sleeve)) {
    const sleeveLabel = SLEEVE_TYPE_LABELS[sleeve];
    const fitLabel = isFitType(fit) ? FIT_TYPE_LABELS[fit] : null;

    return buildPageMetadata({
      title: fitLabel ? `${sleeveLabel} · ${fitLabel}` : sleeveLabel,
      description: "White tees — crew, pocket, relaxed, and long sleeve.",
      path: fit
        ? `/products?sleeve=${sleeve}&fit=${fit}`
        : `/products?sleeve=${sleeve}`,
    });
  }

  return buildPageMetadata({
    title: "TOPS",
    description: "White tees — crew, pocket, relaxed, and long sleeve.",
    path: "/products",
    image: "/store/plp-banner.jpg",
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { fabric: fabricSlug, sleeve: sleeveParam, fit: fitParam, stock } =
    await searchParams;

  if (!isSleeveType(sleeveParam)) {
    redirect(
      buildProductsFilterHref({
        fabric: fabricSlug ?? null,
        sleeve: "short",
        fit: isFitType(fitParam) ? fitParam : null,
      }),
    );
  }

  const [allProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(),
  ]);

  const activeSleeve = sleeveParam;
  const activeFit = isFitType(fitParam) ? fitParam : null;
  const inStockOnly = stock === "in";
  const fabric = fabricSlug ? await getFabricBySlug(fabricSlug) : null;

  let products = allProducts;

  if (fabric) {
    products = products.filter((product) => product.fabricSlug === fabric.slug);
  }

  products = products.filter((product) => product.sleeveType === activeSleeve);

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
      activeSleeve={activeSleeve}
      activeFit={activeFit}
      inStockOnly={inStockOnly}
      fabricNameBySlug={fabricNameBySlug}
    />
  );
}
