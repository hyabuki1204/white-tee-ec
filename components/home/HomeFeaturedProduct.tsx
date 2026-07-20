import Image from "next/image";
import Link from "next/link";
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
      className="border-t border-[#e8e8e6] pb-16 md:pb-20"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <header className="py-10 md:py-12">
          <p className="text-[10px] font-light tracking-[0.2em] text-neutral-400">
            FEATURED
          </p>
          <h2 className="mt-4 max-w-md text-[13px] font-light leading-[1.8] tracking-[0.06em] text-neutral-800">
            {displayName}
          </h2>
          <p className="mt-4 max-w-lg text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-500">
            {product.description}
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:gap-16 lg:gap-20">
          <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f2] md:aspect-[5/6]">
              <Image
                src={product.imageUrl}
                alt={displayName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover transition-opacity duration-700 group-hover:opacity-95"
              />
            </div>
          </Link>

          <div className="flex flex-col gap-8 pb-2 md:pb-6">
            <p className="text-[13px] font-light tracking-[0.05em] text-neutral-600">
              {formatPrice(product.price)}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex w-fit text-[11px] font-light tracking-[0.12em] text-neutral-700 transition-opacity hover:opacity-60"
            >
              View piece
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
