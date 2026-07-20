import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { isSleeveType } from "@/lib/products/silhouette";
import { STORE_TYPO } from "@/lib/store-ui/typography";
import { cn } from "@/lib/utils";
import type { SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";

type HomeProductGridProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
  activeSleeve?: SleeveType;
};

const SLEEVE_OPTIONS: { value: SleeveType; label: string }[] = [
  { value: "short", label: GRAPHPAPER_STORE_COPY.home.sleeveShort },
  { value: "long", label: GRAPHPAPER_STORE_COPY.home.sleeveLong },
];

function buildHomeSleeveHref(sleeve: SleeveType): string {
  return sleeve === "short" ? "/" : `/?sleeve=${sleeve}`;
}

function toggleClass(isActive: boolean) {
  return cn(
    "text-[12px] font-light tracking-[0.12em] transition-opacity duration-300 md:text-[13px]",
    isActive ? "text-neutral-900" : "text-neutral-600 hover:opacity-60",
  );
}

export function HomeProductGrid({
  products,
  fabricNameBySlug,
  activeSleeve = "short",
}: HomeProductGridProps) {
  const sleeve = isSleeveType(activeSleeve) ? activeSleeve : "short";
  const filteredProducts = products.filter(
    (product) => product.sleeveType === sleeve,
  );

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-neutral-200/70 py-8 sm:flex-row sm:items-end sm:justify-between md:py-10">
        <div>
          <h2 className={STORE_TYPO.catalogTitle}>
            {GRAPHPAPER_STORE_COPY.home.sectionAll}
          </h2>
          <p className="mt-3 text-[13px] font-light tracking-[0.06em] text-neutral-600">
            {GRAPHPAPER_STORE_COPY.plp.items(filteredProducts.length)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:items-end">
          <nav
            aria-label="Filter by sleeve length"
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {SLEEVE_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={buildHomeSleeveHref(option.value)}
                aria-current={sleeve === option.value ? "page" : undefined}
                className={toggleClass(sleeve === option.value)}
              >
                {option.label}
              </Link>
            ))}
          </nav>

          <Link
            href={`/products?sleeve=${sleeve}`}
            className="text-[12px] font-light tracking-[0.12em] text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.cart.viewAll}
          </Link>
        </div>
      </header>

      <div className="pt-8 md:pt-10">
        <ProductGrid
          products={filteredProducts}
          fabricNameBySlug={fabricNameBySlug}
        />
      </div>
    </>
  );
}
