import Link from "next/link";
import { buildProductsFilterHref } from "@/lib/products/silhouette";
import { cn } from "@/lib/utils";
import type { FitType, SleeveType } from "@/types/product-fit";

type PlpSleeveToggleProps = {
  activeSleeve: SleeveType | null;
  activeFabricSlug?: string | null;
  activeFit?: FitType | null;
  inStockOnly?: boolean;
};

const SLEEVE_OPTIONS: { value: SleeveType | null; label: string }[] = [
  { value: null, label: "ALL" },
  { value: "short", label: "SHORT SLEEVE" },
  { value: "long", label: "LONG SLEEVE" },
];

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
      className="flex flex-wrap gap-x-6 gap-y-2"
    >
      {SLEEVE_OPTIONS.map((option) => {
        const isActive = activeSleeve === option.value;

        return (
          <Link
            key={option.label}
            href={buildProductsFilterHref({
              fabric: activeFabricSlug,
              sleeve: option.value,
              fit: activeFit,
              stock,
            })}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "type-label inline-flex min-h-11 items-center pb-1 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
              isActive
                ? "border-b border-[var(--color-ink)] text-[var(--color-ink)]"
                : "border-b border-transparent hover:opacity-60",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
