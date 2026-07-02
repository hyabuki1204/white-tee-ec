import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  FIT_TYPES,
  SLEEVE_TYPE_LABELS,
  SLEEVE_TYPES,
} from "@/lib/products/silhouette";
import type { FitType, SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";

type ProductSilhouetteFilterProps = {
  products: Product[];
  activeSleeve?: SleeveType | null;
  activeFit?: FitType | null;
  fabricSlug?: string | null;
};

function availableFits(
  products: Product[],
  sleeve: SleeveType | null | undefined,
): FitType[] {
  const fits = new Set<FitType>();

  for (const product of products) {
    if (sleeve && product.sleeveType !== sleeve) {
      continue;
    }

    fits.add(product.fitType);
  }

  return FIT_TYPES.filter((fit) => fits.has(fit));
}

export function ProductSilhouetteFilter({
  products,
  activeSleeve,
  activeFit,
  fabricSlug,
}: ProductSilhouetteFilterProps) {
  const linkClass = (isActive: boolean) =>
    cn(
      "inline-flex min-h-9 items-center text-[12px] font-light tracking-[0.06em] transition-opacity duration-300 md:text-[12px]",
      isActive ? "text-neutral-800" : "text-neutral-600 hover:opacity-60",
    );

  const fitOptions = availableFits(products, activeSleeve);

  return (
    <nav
      aria-label="Filter by silhouette"
      className="mb-8 space-y-4 md:mb-10"
    >
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Link
          href={buildProductsFilterHref({ fabric: fabricSlug })}
          className={linkClass(!activeSleeve)}
        >
          All silhouettes
        </Link>
        {SLEEVE_TYPES.map((sleeve) => {
          const hasProducts = products.some(
            (product) => product.sleeveType === sleeve,
          );

          if (!hasProducts) {
            return null;
          }

          return (
            <Link
              key={sleeve}
              href={buildProductsFilterHref({
                sleeve,
                fabric: fabricSlug,
              })}
              className={linkClass(activeSleeve === sleeve && !activeFit)}
            >
              {SLEEVE_TYPE_LABELS[sleeve]}
            </Link>
          );
        })}
      </div>

      {activeSleeve && fitOptions.length > 0 ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2 pl-0 md:pl-1">
          {fitOptions.map((fit) => (
            <Link
              key={fit}
              href={buildProductsFilterHref({
                sleeve: activeSleeve,
                fit,
                fabric: fabricSlug,
              })}
              className={linkClass(activeFit === fit)}
            >
              {FIT_TYPE_LABELS[fit]}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
