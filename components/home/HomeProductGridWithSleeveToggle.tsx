"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { isSleeveType } from "@/lib/products/silhouette";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { cn } from "@/lib/utils";
import type { SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";

type HomeProductGridWithSleeveToggleProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

const SLEEVE_OPTIONS: { value: SleeveType; label: string }[] = [
  { value: "short", label: GRAPHPAPER_STORE_COPY.home.sleeveShort },
  { value: "long", label: GRAPHPAPER_STORE_COPY.home.sleeveLong },
];

function buildHomeSleeveHref(sleeve: SleeveType): string {
  return sleeve === "short" ? "/" : `/?sleeve=${sleeve}`;
}

export function HomeProductGridWithSleeveToggle({
  products,
  fabricNameBySlug,
}: HomeProductGridWithSleeveToggleProps) {
  const searchParams = useSearchParams();
  const sleeveParam = searchParams.get("sleeve");
  const sleeve: SleeveType = isSleeveType(sleeveParam) ? sleeveParam : "short";
  const filteredProducts = products.filter(
    (product) => product.sleeveType === sleeve,
  );

  const toggleClass = (isActive: boolean) =>
    cn(
      "text-[10px] font-light tracking-[0.12em] transition-opacity duration-300 md:text-[11px]",
      isActive ? "text-neutral-800" : "text-neutral-400 hover:opacity-60",
    );

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-neutral-200/70 py-8 sm:flex-row sm:items-end sm:justify-between md:py-10">
        <div>
          <h1 className="text-[13px] font-light tracking-[0.28em] text-neutral-800">
            {GRAPHPAPER_STORE_COPY.home.sectionAll}
          </h1>
          <p className="mt-3 text-[11px] font-light tracking-[0.08em] text-neutral-400">
            {GRAPHPAPER_STORE_COPY.plp.items(filteredProducts.length)}
          </p>
        </div>

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
