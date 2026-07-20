import Link from "next/link";
import { buildProductsFilterHref } from "@/lib/products/silhouette";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { cn } from "@/lib/utils";
import type { FitType, SleeveType } from "@/types/product-fit";

type PlpSleeveToggleProps = {
  activeSleeve: SleeveType;
  activeFabricSlug?: string | null;
  activeFit?: FitType | null;
  inStockOnly?: boolean;
};

const SLEEVE_OPTIONS: { value: SleeveType; label: string }[] = [
  { value: "short", label: GRAPHPAPER_STORE_COPY.home.sleeveShort },
  { value: "long", label: GRAPHPAPER_STORE_COPY.home.sleeveLong },
];

function toggleClass(isActive: boolean) {
  return cn(
    "text-[11px] font-light tracking-[0.12em] transition-opacity duration-300 md:text-[13px]",
    isActive ? "text-neutral-800" : "text-neutral-600 hover:opacity-60",
  );
}

export function PlpSleeveToggle({
  activeSleeve,
  activeFabricSlug,
  activeFit,
  inStockOnly = false,
}: PlpSleeveToggleProps) {
  const stock = inStockOnly ? ("in" as const) : null;

  return (
    <nav
      aria-label="Filter by sleeve length"
      className="flex flex-wrap gap-x-5 gap-y-2"
    >
      {SLEEVE_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={buildProductsFilterHref({
            fabric: activeFabricSlug,
            sleeve: option.value,
            fit: activeFit,
            stock,
          })}
          aria-current={activeSleeve === option.value ? "page" : undefined}
          className={toggleClass(activeSleeve === option.value)}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
