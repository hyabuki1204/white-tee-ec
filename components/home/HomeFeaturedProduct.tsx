import Image from "next/image";
import Link from "next/link";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { HOME_FEATURED_PRODUCT_SLUG } from "@/lib/store-ui/home-featured";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";

type HomeFeaturedProductProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

export function HomeFeaturedProduct({
  products,
  fabricNameBySlug,
}: HomeFeaturedProductProps) {
  const product = products.find((entry) => entry.slug === HOME_FEATURED_PRODUCT_SLUG);

  if (!product) {
    return null;
  }

  const fabricName = product.fabricSlug
    ? fabricNameBySlug[product.fabricSlug]
    : null;
  const displayName = getGraphpaperDisplayName(product, fabricName);

  return (
    <section
      aria-label="Featured product"
      className="border-t border-[var(--color-hairline)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <HomeSectionHeading label="FEATURED" title={displayName} />
        <p className="mt-[var(--space-2)] max-w-lg text-[14px] font-normal leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--color-ink-soft)]">
          {product.description}
        </p>

        <div className="mt-[var(--space-4)] grid gap-10 md:mt-[var(--space-5)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:gap-16 lg:gap-20">
          <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)] md:aspect-[5/6]">
              <Image
                src={product.imageUrl}
                alt={displayName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] group-hover:opacity-95"
              />
            </div>
          </Link>

          <div className="flex flex-col gap-8 pb-2 md:pb-6">
            <p className="text-[14px] font-normal tracking-[0.05em] text-[var(--color-ink-soft)]">
              {formatPrice(product.price)}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex w-fit type-label text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
            >
              View piece
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
