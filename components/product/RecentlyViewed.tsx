"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/layout/Container";
import { getRecentlyViewedSlugs } from "@/lib/navigation/recently-viewed";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { Product } from "@/types";

type RecentlyViewedProps = {
  currentSlug: string;
  allProducts: Product[];
  fabricNameBySlug: Record<string, string>;
};

export function RecentlyViewed({
  currentSlug,
  allProducts,
  fabricNameBySlug,
}: RecentlyViewedProps) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getRecentlyViewedSlugs(currentSlug));
  }, [currentSlug]);

  const products = slugs
    .map((slug) => allProducts.find((product) => product.slug === slug))
    .filter((product): product is Product => product != null);

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-label={GRAPHPAPER_STORE_COPY.pdp.recentlyViewed}>
      <Container as="div" className="border-t border-neutral-200/60 py-16 sm:py-24 md:py-32 lg:py-40">
        <p className="mb-12 text-center text-[12px] font-light tracking-[0.12em] text-neutral-600 sm:mb-16 md:mb-20 md:text-[12px]">
          {GRAPHPAPER_STORE_COPY.pdp.recentlyViewed}
        </p>

        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-x-6 gap-y-16 sm:gap-x-10 sm:gap-y-24 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                fabricName={
                  product.fabricSlug
                    ? fabricNameBySlug[product.fabricSlug]
                    : null
                }
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
