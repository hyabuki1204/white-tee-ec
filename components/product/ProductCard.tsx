"use client";

import Image from "next/image";
import Link from "next/link";
import { SoftImage } from "@/components/motion/SoftImage";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { getProductWearImageUrl } from "@/lib/products/wear-image";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  fabricName?: string | null;
  soldOut?: boolean;
  className?: string;
};

const IMAGE_TRANSITION =
  "transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)]";

export function ProductCard({
  product,
  fabricName,
  soldOut = false,
  className,
}: ProductCardProps) {
  const wearImageUrl = getProductWearImageUrl(product);
  const displayName = getGraphpaperDisplayName(product, fabricName);
  const outOfStock =
    soldOut ||
    product.variants.every((variant) => variant.stockQuantity < 1);

  return (
    <article className={cn("group", className)} data-reveal>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-placeholder)]">
          <SoftImage
            src={product.imageUrl}
            alt={displayName}
            fill
            quality={90}
            sizes="(max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover",
              IMAGE_TRANSITION,
              wearImageUrl
                ? "[@media(hover:hover)]:group-hover:opacity-0"
                : "[@media(hover:hover)]:group-hover:opacity-[0.85]",
            )}
          />
          {wearImageUrl ? (
            <Image
              src={wearImageUrl}
              alt=""
              aria-hidden
              fill
              quality={90}
              sizes="(max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover opacity-0",
                IMAGE_TRANSITION,
                "[@media(hover:hover)]:group-hover:opacity-100",
              )}
            />
          ) : null}

          {outOfStock ? (
            <span className="type-fine absolute left-3 top-3 bg-background/90 px-2 py-1 tracking-[0.16em] text-[var(--color-ink-soft)]">
              SOLD OUT
            </span>
          ) : null}
        </div>

        <p className="type-body mt-3 leading-snug text-[var(--color-ink)]">
          {displayName}
        </p>
        <p className="type-caption mt-1">{formatPrice(product.price)}</p>
      </Link>
    </article>
  );
}
