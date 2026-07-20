import type { Metadata } from "next";
import { ProductListingLayout } from "@/components/product/ProductListingLayout";
import { getFabricBySlug, getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import {
  FIT_TYPE_LABELS,
  isFitType,
  isInStockProduct,
  isSleeveType,
  SLEEVE_TYPE_LABELS,
} from "@/lib/products/silhouette";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

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
        title: `${fabric.name} · Products`,
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
    title: "Products",
    description: "White tees — crew, pocket, relaxed, and long sleeve.",
    path: "/products",
    image: "/store/plp-banner.jpg",
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { fabric: fabricSlug, sleeve: sleeveParam, fit: fitParam, stock } =
    await searchParams;

  const [allProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(),
  ]);

  const activeSleeve = isSleeveType(sleeveParam) ? sleeveParam : null;
  const activeFit = isFitType(fitParam) ? fitParam : null;
  const inStockOnly = stock === "in";
  const fabric = fabricSlug ? await getFabricBySlug(fabricSlug) : null;

  let products = allProducts;

  if (fabric) {
    products = products.filter((product) => product.fabricSlug === fabric.slug);
  }

  if (activeSleeve) {
    products = products.filter((product) => product.sleeveType === activeSleeve);
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
      activeSleeve={activeSleeve}
      activeFit={activeFit}
      inStockOnly={inStockOnly}
      fabricNameBySlug={fabricNameBySlug}
    />
  );
}
