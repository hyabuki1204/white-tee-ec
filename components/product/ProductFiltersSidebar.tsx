import Link from "next/link";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  FIT_TYPES,
} from "@/lib/products/silhouette";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { Fabric } from "@/lib/fabric/content";
import type { FitType, SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type ProductFiltersSidebarProps = {
  fabrics: Fabric[];
  products: Product[];
  activeFabricSlug?: string | null;
  activeSleeve?: SleeveType | null;
  activeFit?: FitType | null;
};

function filterLinkClass(isActive: boolean) {
  return cn(
    "block py-1 text-[11px] font-light tracking-[0.04em] transition-opacity hover:opacity-60",
    isActive ? "text-neutral-900" : "text-neutral-500",
  );
}

function sectionTitle(label: string) {
  return (
    <p className="mb-3 text-[10px] font-light tracking-[0.14em] text-neutral-400">
      {label}
    </p>
  );
}

function availableFits(
  products: Product[],
  sleeve: SleeveType | null | undefined,
): FitType[] {
  const fits = new Set<FitType>();

  for (const product of products) {
    if (sleeve && product.sleeveType !== sleeve) continue;
    fits.add(product.fitType);
  }

  return FIT_TYPES.filter((fit) => fits.has(fit));
}

export function ProductFiltersSidebar({
  fabrics,
  products,
  activeFabricSlug,
  activeSleeve,
  activeFit,
}: ProductFiltersSidebarProps) {
  const copy = GRAPHPAPER_STORE_COPY.filters;
  const fitOptions = availableFits(products, activeSleeve);

  return (
    <>
      <details className="border-b border-neutral-200/70 pb-6 lg:hidden">
        <summary className="cursor-pointer list-none text-[11px] font-light tracking-[0.12em] text-neutral-700 [&::-webkit-details-marker]:hidden">
          {copy.title}
        </summary>
        <div className="mt-6 space-y-8">
          <FilterSections
            fabrics={fabrics}
            fitOptions={fitOptions}
            activeFabricSlug={activeFabricSlug}
            activeSleeve={activeSleeve}
            activeFit={activeFit}
          />
        </div>
      </details>

      <aside
        aria-label="Product filters"
        className="hidden w-44 shrink-0 lg:block xl:w-48"
      >
        <p className="mb-8 text-[10px] font-light tracking-[0.14em] text-neutral-400">
          {copy.title}
        </p>
        <FilterSections
          fabrics={fabrics}
          fitOptions={fitOptions}
          activeFabricSlug={activeFabricSlug}
          activeSleeve={activeSleeve}
          activeFit={activeFit}
        />
      </aside>
    </>
  );
}

function FilterSections({
  fabrics,
  fitOptions,
  activeFabricSlug,
  activeSleeve,
  activeFit,
}: {
  fabrics: Fabric[];
  fitOptions: FitType[];
  activeFabricSlug?: string | null;
  activeSleeve?: SleeveType | null;
  activeFit?: FitType | null;
}) {
  const copy = GRAPHPAPER_STORE_COPY.filters;

  return (
    <div className="space-y-8">
      <section>
        {sectionTitle(copy.fabric)}
        <ul className="space-y-1">
          <li>
            <Link
              href={buildProductsFilterHref({
                sleeve: activeSleeve,
                fit: activeFit,
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
                  fit: activeFit,
                })}
                className={filterLinkClass(activeFabricSlug === fabric.slug)}
              >
                {fabric.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {activeSleeve && fitOptions.length > 0 ? (
        <section>
          {sectionTitle(copy.fit)}
          <ul className="space-y-1">
            {fitOptions.map((fit) => (
              <li key={fit}>
                <Link
                  href={buildProductsFilterHref({
                    fabric: activeFabricSlug,
                    sleeve: activeSleeve,
                    fit,
                  })}
                  className={filterLinkClass(activeFit === fit)}
                >
                  {FIT_TYPE_LABELS[fit]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
