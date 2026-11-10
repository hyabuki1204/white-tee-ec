import Image from "next/image";
import Link from "next/link";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { HOME_FEATURED_PRODUCT_SLUG } from "@/lib/store-ui/home-featured";
import { STORE_TYPO } from "@/lib/store-ui/typography";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";
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
      className="py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-12 md:items-center md:gap-0 md:px-8 lg:px-12">
        <Link
          href={`/products/${product.slug}`}
          className="group block md:col-span-6"
          tabIndex={-1}
          aria-hidden
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-placeholder)]">
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] [@media(hover:hover)]:group-hover:opacity-95"
            />
          </div>
        </Link>

        <div className="md:col-span-4 md:col-start-8">
          <HomeSectionHeading label="FEATURED" title={displayName} />
          <p className={cn(STORE_TYPO.body, "mt-[var(--space-2)] max-w-[28em]")}>
            {product.description}
          </p>
          <p
            className={cn(
              STORE_TYPO.bodyInk,
              STORE_TYPO.figure,
              "mt-[var(--space-3)]",
            )}
          >
            {formatPrice(product.price)}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-[var(--space-4)] inline-flex w-fit border-b border-[var(--color-ink)] pb-1 type-label text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
          >
            View piece
          </Link>
        </div>
      </div>
    </section>
  );
}
