"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { ApproxPrice } from "@/components/currency/ApproxPrice";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { SoftImage } from "@/components/motion/SoftImage";
import { SaveCardButton } from "@/components/saved/SaveButton";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import { joinSpec } from "@/lib/i18n/format";
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
  const locale = useLocale();
  const wearImageUrl = getProductWearImageUrl(product);
  const displayName = getGraphpaperDisplayName(product, fabricName);
  const spec = getGaugeSpec(product.fabricSlug, locale);
  const outOfStock =
    soldOut ||
    product.variants.every((variant) => variant.stockQuantity < 1);

  return (
    <article className={cn("group relative", className)} data-reveal>
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

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="font-en text-[17px] leading-snug tracking-[0.02em] text-[var(--color-ink)]">
            {displayName}
          </p>
          <p className="font-en shrink-0 text-right text-[14px] tabular-nums tracking-[0.04em] text-[var(--color-ink)]">
            {formatPrice(product.price)}
          </p>
        </div>
        {spec ? (
          <p className="type-caption mt-1">
            {joinSpec(locale, spec.yarn, formatWeight(spec))}
          </p>
        ) : null}
        {/* English only: the estimate sits on its own line so the name keeps
            its width on narrow cards. */}
        <ApproxPrice
          amount={product.price}
          bracketed={false}
          className="mt-0.5 block text-[12px] tracking-[0.02em]"
        />
      </Link>
      <SaveCardButton productId={product.id} productName={displayName} />
    </article>
  );
}
