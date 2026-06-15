import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFabricFilter } from "@/components/product/ProductFabricFilter";
import { ProductSilhouetteFilter } from "@/components/product/ProductSilhouetteFilter";
import { getFabricBySlug, getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import {
  FIT_TYPE_LABELS,
  isFitType,
  isSleeveType,
  SLEEVE_TYPE_LABELS,
} from "@/lib/products/silhouette";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProductsPageProps = {
  searchParams: Promise<{
    fabric?: string;
    sleeve?: string;
    fit?: string;
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
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { fabric: fabricSlug, sleeve: sleeveParam, fit: fitParam } =
    await searchParams;
  const [allProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(),
  ]);

  const activeSleeve = isSleeveType(sleeveParam) ? sleeveParam : null;
  const activeFit = isFitType(fitParam) ? fitParam : null;
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

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
  );
  const fabricCharacterBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.character]),
  );

  const { product: copy } = SITE_UI_COPY;

  return (
    <Container as="section" className="py-20 md:py-32 lg:py-40">
      <header className="mb-20 md:mb-28">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          {SITE_UI_COPY.breadcrumbs.products}
        </p>
        {fabric ? (
          <p className="mt-6 max-w-sm text-[13px] font-light leading-[1.95] tracking-[0.03em] text-neutral-600 md:text-xs md:leading-[2.15] md:text-neutral-500">
            {copy.filteredIntro(fabric.name)}
          </p>
        ) : (
          <div className="mt-6 max-w-sm space-y-2">
            <p className="text-[13px] font-light leading-[1.95] tracking-[0.03em] text-neutral-600 md:text-xs md:leading-[2.15] md:text-neutral-500">
              {copy.plpIntro}
            </p>
            <p className="text-[11px] font-light tracking-[0.04em] text-neutral-400 md:text-[10px]">
              {copy.plpIntroSub}
            </p>
          </div>
        )}
      </header>

      <ProductSilhouetteFilter
        products={allProducts}
        activeSleeve={activeSleeve}
        activeFit={activeFit}
        fabricSlug={fabric?.slug ?? null}
      />

      <ProductFabricFilter
        fabrics={fabrics}
        activeSlug={fabric?.slug ?? null}
        activeSleeve={activeSleeve}
        activeFit={activeFit}
      />

      <ProductGrid
        products={products}
        fabricNameBySlug={fabricNameBySlug}
        fabricCharacterBySlug={fabricCharacterBySlug}
      />
    </Container>
  );
}
