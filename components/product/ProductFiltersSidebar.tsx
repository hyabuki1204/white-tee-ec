import { Link } from "@/components/i18n/Link";
import { getGaugeLabel } from "@/lib/navigation/store-nav";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  STOREFRONT_FIT_TYPES,
} from "@/lib/products/silhouette";
import type { Locale } from "@/lib/i18n/config";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import type { Fabric } from "@/lib/fabric/content";
import type { FitType } from "@/types/product-fit";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type ProductFiltersSidebarProps = {
  locale: Locale;
  fabrics: Fabric[];
  products: Product[];
  activeFabricSlug?: string | null;
  activeFit?: FitType | null;
  inStockOnly?: boolean;
};

type FilterSectionsProps = Omit<ProductFiltersSidebarProps, "products">;

function filterLinkClass(isActive: boolean) {
  return cn(
    "block py-1 text-[12px] font-normal tracking-[0.04em] transition-opacity hover:opacity-60",
    isActive ? "text-neutral-900" : "text-neutral-600",
  );
}

function sectionTitle(label: string) {
  return (
    <p className="mb-3 text-[11px] font-normal tracking-[0.14em] text-neutral-600">
      {label}
    </p>
  );
}

export function ProductFiltersSidebar({
  locale,
  fabrics,
  products,
  activeFabricSlug,
  activeFit,
  inStockOnly = false,
}: ProductFiltersSidebarProps) {
  const copy = getStoreCopy(locale).filters;

  // Only offer gauges that have at least one listed product.
  const listedFabricSlugs = new Set(
    products.map((product) => product.fabricSlug),
  );
  const gaugeFabrics = fabrics.filter((fabric) =>
    listedFabricSlugs.has(fabric.slug),
  );

  const sections = (
    <FilterSections
      locale={locale}
      fabrics={gaugeFabrics}
      activeFabricSlug={activeFabricSlug}
      activeFit={activeFit}
      inStockOnly={inStockOnly}
    />
  );

  return (
    <>
      <details className="border-b border-neutral-200/70 pb-6 lg:hidden" open>
        <summary className="cursor-pointer list-none text-[12px] font-normal tracking-[0.12em] text-neutral-700 [&::-webkit-details-marker]:hidden">
          {copy.title}
        </summary>
        <div className="mt-6 space-y-8">{sections}</div>
      </details>

      <aside
        aria-label={copy.title}
        className="hidden w-44 shrink-0 lg:block xl:w-48"
      >
        <p className="mb-8 text-[11px] font-normal tracking-[0.14em] text-neutral-600">
          {copy.title}
        </p>
        {sections}
      </aside>
    </>
  );
}

function FilterSections({
  locale,
  fabrics,
  activeFabricSlug,
  activeFit,
  inStockOnly = false,
}: FilterSectionsProps) {
  const copy = getStoreCopy(locale).filters;
  const stockParam = inStockOnly ? ("in" as const) : null;

  return (
    <div className="space-y-8">
      <section>
        {sectionTitle(copy.fabric)}
        <ul className="space-y-1">
          <li>
            <Link
              href={buildProductsFilterHref({
                fit: activeFit,
                stock: stockParam,
              })}
              aria-current={!activeFabricSlug ? "true" : undefined}
              className={filterLinkClass(!activeFabricSlug)}
            >
              {copy.all}
            </Link>
          </li>
          {fabrics.map((fabric) => (
            <li key={fabric.slug}>
              <Link
                href={buildProductsFilterHref({
                  fabric: fabric.slug,
                  fit: activeFit,
                  stock: stockParam,
                })}
                aria-current={
                  activeFabricSlug === fabric.slug ? "true" : undefined
                }
                className={filterLinkClass(activeFabricSlug === fabric.slug)}
              >
                {getGaugeLabel(fabric)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {sectionTitle(copy.fit)}
        <ul className="space-y-1">
          <li>
            <Link
              href={buildProductsFilterHref({
                fabric: activeFabricSlug,
                stock: stockParam,
              })}
              aria-current={!activeFit ? "true" : undefined}
              className={filterLinkClass(!activeFit)}
            >
              {copy.all}
            </Link>
          </li>
          {STOREFRONT_FIT_TYPES.map((fit) => (
            <li key={fit}>
              <Link
                href={buildProductsFilterHref({
                  fabric: activeFabricSlug,
                  fit,
                  stock: stockParam,
                })}
                aria-current={activeFit === fit ? "true" : undefined}
                className={filterLinkClass(activeFit === fit)}
              >
                {FIT_TYPE_LABELS[fit]}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {sectionTitle(copy.availability)}
        <ul className="space-y-1">
          <li>
            <Link
              href={buildProductsFilterHref({
                fabric: activeFabricSlug,
                fit: activeFit,
              })}
              aria-current={!inStockOnly ? "true" : undefined}
              className={filterLinkClass(!inStockOnly)}
            >
              {copy.all}
            </Link>
          </li>
          <li>
            <Link
              href={buildProductsFilterHref({
                fabric: activeFabricSlug,
                fit: activeFit,
                stock: "in",
              })}
              aria-current={inStockOnly ? "true" : undefined}
              className={filterLinkClass(inStockOnly)}
            >
              {copy.inStock}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
