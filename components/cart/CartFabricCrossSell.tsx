"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type CartFabricCrossSellProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
  className?: string;
};

export function CartFabricCrossSell({
  products,
  fabricNameBySlug,
  className,
}: CartFabricCrossSellProps) {
  const copy = getStoreCopy(useLocale()).cart;

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-label={copy.pairWith} className={cn(className)}>
      <p className="type-label !text-[var(--color-navy)]">{copy.alsoLabel}</p>
      <h2 className="type-h2 mt-3">{copy.pairWithTitle}</h2>
      <ul className="mt-[var(--space-4)] grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 [&>li:nth-child(n+3)]:hidden lg:[&>li:nth-child(n+3)]:block">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              fabricName={
                product.fabricSlug && fabricNameBySlug
                  ? fabricNameBySlug[product.fabricSlug]
                  : null
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
