import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  STOREFRONT_FIT_TYPES,
} from "@/lib/products/silhouette";
import type { FitType } from "@/types/product-fit";
import type { Product } from "@/types";

type ProductSilhouetteFilterProps = {
  products: Product[];
  activeFit?: FitType | null;
  fabricSlug?: string | null;
};

/** Inline silhouette filter: All / Regular / Box. */
export function ProductSilhouetteFilter({
  products,
  activeFit,
  fabricSlug,
}: ProductSilhouetteFilterProps) {
  const linkClass = (isActive: boolean) =>
    cn(
      "inline-flex min-h-9 items-center text-[12px] font-normal tracking-[0.06em] transition-opacity duration-[var(--duration-fast)] md:text-[12px]",
      isActive ? "text-neutral-800" : "text-neutral-600 hover:opacity-60",
    );

  const fitOptions = STOREFRONT_FIT_TYPES.filter((fit) =>
    products.some((product) => product.fitType === fit),
  );

  return (
    <nav
      aria-label="Filter by silhouette"
      className="mb-8 flex flex-wrap gap-x-5 gap-y-2 md:mb-10"
    >
      <Link
        href={buildProductsFilterHref({ fabric: fabricSlug })}
        className={linkClass(!activeFit)}
      >
        All silhouettes
      </Link>
      {fitOptions.map((fit) => (
        <Link
          key={fit}
          href={buildProductsFilterHref({ fit, fabric: fabricSlug })}
          className={linkClass(activeFit === fit)}
        >
          {FIT_TYPE_LABELS[fit]}
        </Link>
      ))}
    </nav>
  );
}
