import type { Metadata } from "next";
import {
  SavedPageContent,
  type SavedProductView,
} from "@/components/saved/SavedPageContent";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import { getFabrics } from "@/lib/fabric/queries";
import { PRODUCT_SIZES } from "@/lib/products/defaults";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { getProductsWithStock } from "@/lib/products/queries";
import { SAVED_COPY } from "@/lib/saved/copy";
import { buildPageMetadata } from "@/lib/seo/metadata";

const { page: copy } = SAVED_COPY;

// The list itself lives in the browser; price and stock must be current.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: copy.label,
  description: copy.title,
  path: "/saved",
  noIndex: true,
});

export default async function SavedPage() {
  const [products, fabrics] = await Promise.all([
    getProductsWithStock(),
    getFabrics(),
  ]);
  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );

  // Only what the rows need — the full product objects stay on the server.
  const views: SavedProductView[] = products.map((product) => {
    const spec = getGaugeSpec(product.fabricSlug);

    return {
      id: product.id,
      slug: product.slug,
      name: getGraphpaperDisplayName(
        product,
        product.fabricSlug ? fabricNameBySlug[product.fabricSlug] : null,
      ),
      caption: spec ? `${spec.yarn}・${formatWeight(spec)}` : null,
      price: product.price,
      imageUrl: product.imageUrl,
      variants: PRODUCT_SIZES.flatMap((size) => {
        const variant = product.variants.find((entry) => entry.size === size);
        return variant
          ? [{ size, stockQuantity: variant.stockQuantity }]
          : [];
      }),
    };
  });

  return (
    <>
      <header className="border-b border-[var(--color-hairline)] bg-[var(--color-surface)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-8 md:py-16 lg:px-12">
          <div>
            <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
            <h1 className="type-display mt-3">{copy.title}</h1>
          </div>
          <p className="type-body max-w-[26em] text-[var(--color-ink-soft)]">
            {copy.lead}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 md:px-8 md:pb-28 md:pt-14 lg:px-12">
        <SavedPageContent products={views} />
      </div>
    </>
  );
}
