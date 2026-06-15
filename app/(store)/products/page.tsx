import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getFabricBySlug, getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProductsPageProps = {
  searchParams: Promise<{ fabric?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { fabric: fabricSlug } = await searchParams;

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

  return buildPageMetadata({
    title: "Products",
    description: "White tees — crew, pocket, relaxed, and long sleeve.",
    path: "/products",
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { fabric: fabricSlug } = await searchParams;
  const [allProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(),
  ]);

  const fabric = fabricSlug ? await getFabricBySlug(fabricSlug) : null;
  const products =
    fabric !== null
      ? allProducts.filter((product) => product.fabricSlug === fabric.slug)
      : allProducts;

  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((entry) => [entry.slug, entry.name]),
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

      <ProductGrid
        products={products}
        fabricNameBySlug={fabricNameBySlug}
      />
    </Container>
  );
}
