"use client";

import Image from "next/image";
import Link from "next/link";
import { getGraphpaperDisplayName, STORE_BRAND_LINE } from "@/lib/products/display-name";
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
  "transition-opacity duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

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
    <article className={cn("group", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f2]">
          <Image
            src={product.imageUrl}
            alt={displayName}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover",
              IMAGE_TRANSITION,
              wearImageUrl &&
                "[@media(hover:hover)]:group-hover:opacity-0",
            )}
          />
          {wearImageUrl ? (
            <Image
              src={wearImageUrl}
              alt=""
              aria-hidden
              fill
              quality={90}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover opacity-0",
                IMAGE_TRANSITION,
                "[@media(hover:hover)]:group-hover:opacity-100",
              )}
            />
          ) : null}

          {outOfStock ? (
            <span className="absolute left-3 top-3 bg-background/90 px-2 py-1 text-[9px] font-light tracking-[0.16em] text-neutral-600">
              SOLD OUT
            </span>
          ) : null}

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/25 to-transparent px-4 pb-4 pt-20",
              "opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100",
              "[@media(hover:none)]:opacity-100 [@media(hover:none)]:from-neutral-900/45",
            )}
          >
            <p className="text-[10px] font-light tracking-[0.12em] text-white/85">
              {STORE_BRAND_LINE}
            </p>
            <p className="mt-1 text-[11px] font-light leading-snug tracking-[0.03em] text-white">
              {displayName}
            </p>
            <p className="mt-2 text-[11px] font-light tracking-wide text-white/90">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
