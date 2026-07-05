import Link from "next/link";
import { buildProductsFilterHref } from "@/lib/products/silhouette";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { Fabric } from "@/lib/fabric/content";
import type { SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type ProductFiltersSidebarProps = {
  fabrics: Fabric[];
  products: Product[];
  activeFabricSlug?: string | null;
  activeSleeve?: SleeveType | null;
  inStockOnly?: boolean;
};

function filterLinkClass(isActive: boolean) {
  return cn(
    "block py-1 text-[12px] font-light tracking-[0.04em] transition-opacity hover:opacity-60",
    isActive ? "text-neutral-900" : "text-neutral-600",
  );
}

function sectionTitle(label: string) {
  return (
    <p className="mb-3 text-[11px] font-light tracking-[0.14em] text-neutral-600">
      {label}
    </p>
  );
}

export function ProductFiltersSidebar({
  fabrics,
  activeFabricSlug,
  activeSleeve,
  inStockOnly = false,
}: ProductFiltersSidebarProps) {
  const copy = GRAPHPAPER_STORE_COPY.filters;

  return (
    <>
      <details className="border-b border-neutral-200/70 pb-6 lg:hidden" open>
        <summary className="cursor-pointer list-none text-[12px] font-light tracking-[0.12em] text-neutral-700 [&::-webkit-details-marker]:hidden">
          {copy.title}
        </summary>
        <div className="mt-6 space-y-8">
          <FilterSections
            fabrics={fabrics}
            activeFabricSlug={activeFabricSlug}
            activeSleeve={activeSleeve}
            inStockOnly={inStockOnly}
          />
        </div>
      </details>

      <aside
        aria-label="Product filters"
        className="hidden w-44 shrink-0 lg:block xl:w-48"
      >
        <p className="mb-8 text-[11px] font-light tracking-[0.14em] text-neutral-600">
          {copy.title}
        </p>
        <FilterSections
          fabrics={fabrics}
          activeFabricSlug={activeFabricSlug}
          activeSleeve={activeSleeve}
          inStockOnly={inStockOnly}
        />
      </aside>
    </>
  );
}

function FilterSections({
  fabrics,
  activeFabricSlug,
  activeSleeve,
  inStockOnly = false,
}: {
  fabrics: Fabric[];
  activeFabricSlug?: string | null;
  activeSleeve?: SleeveType | null;
  inStockOnly?: boolean;
}) {
  const copy = GRAPHPAPER_STORE_COPY.filters;
  const stockOnly = inStockOnly;
  const stockParam = stockOnly ? ("in" as const) : null;

  return (
    <div className="space-y-8">
      <section>
        {sectionTitle(copy.availability)}
        <ul className="space-y-1">
          <li>
            <Link
              href={buildProductsFilterHref({
                fabric: activeFabricSlug,
                sleeve: activeSleeve,
              })}
              className={filterLinkClass(!stockOnly)}
            >
              {copy.all}
            </Link>
          </li>
          <li>
            <Link
              href={buildProductsFilterHref({
                fabric: activeFabricSlug,
                sleeve: activeSleeve,
                stock: "in",
              })}
              className={filterLinkClass(stockOnly)}
            >
              {copy.inStock}
            </Link>
          </li>
        </ul>
      </section>

      <section>
        {sectionTitle(copy.fabric)}
        <ul className="space-y-1">
          <li>
            <Link
              href={buildProductsFilterHref({
                sleeve: activeSleeve,
                stock: stockParam,
              })}
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
                  sleeve: activeSleeve,
                  stock: stockParam,
                })}
                className={filterLinkClass(activeFabricSlug === fabric.slug)}
              >
                {fabric.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
