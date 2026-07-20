import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildProductsFilterHref } from "@/lib/products/silhouette";
import type { Fabric } from "@/lib/fabric/content";
import type { FitType, SleeveType } from "@/types/product-fit";

type ProductFabricFilterProps = {
  fabrics: Fabric[];
  activeSlug?: string | null;
  activeSleeve?: SleeveType | null;
  activeFit?: FitType | null;
};

export function ProductFabricFilter({
  fabrics,
  activeSlug,
  activeSleeve,
  activeFit,
}: ProductFabricFilterProps) {
  const linkClass = (isActive: boolean) =>
    cn(
      "inline-flex min-h-9 items-center text-[12px] font-normal tracking-[0.06em] transition-opacity duration-[var(--duration-fast)] md:text-[12px]",
      isActive
        ? "text-neutral-800"
        : "text-neutral-600 hover:opacity-60",
    );

  return (
    <nav
      aria-label="Filter by fabric"
      className="mb-12 flex flex-wrap gap-x-5 gap-y-2 md:mb-16"
    >
      <Link
        href={buildProductsFilterHref({ sleeve: activeSleeve, fit: activeFit })}
        className={linkClass(!activeSlug)}
      >
        All
      </Link>
      {fabrics.map((fabric) => (
        <Link
          key={fabric.slug}
          href={buildProductsFilterHref({
            fabric: fabric.slug,
            sleeve: activeSleeve,
            fit: activeFit,
          })}
          className={linkClass(activeSlug === fabric.slug)}
        >
          {fabric.name}
        </Link>
      ))}
    </nav>
  );
}
