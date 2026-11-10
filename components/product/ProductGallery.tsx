"use client";

import { SoftImage } from "@/components/motion/SoftImage";
import { useCallback, useRef, useState } from "react";
import type { Product, ProductImage } from "@/types";

type ProductGalleryProps = {
  product: Product;
  displayName?: string;
};

function resolveImages(product: Product): ProductImage[] {
  if (product.images.length > 0) {
    return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  if (product.imageUrl) {
    return [
      {
        id: "fallback",
        url: product.imageUrl,
        sortOrder: 0,
        isPrimary: true,
      },
    ];
  }

  return [];
}

export function ProductGallery({ product, displayName }: ProductGalleryProps) {
  const images = resolveImages(product);
  const imageAlt = displayName ?? product.name;
  const hasMultiple = images.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || !hasMultiple) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    const next = Math.min(
      Math.max(Math.round(container.scrollLeft / width), 0),
      images.length - 1,
    );

    if (next !== activeIndex) {
      setActiveIndex(next);
    }
  }, [activeIndex, hasMultiple, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-[var(--color-image-placeholder)]">
        <p className="type-caption">No image</p>
      </div>
    );
  }

  return (
    <div>
      <ul className="hidden lg:block">
        {images.map((image, index) => (
          <li
            key={image.id}
            className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-image-placeholder)]"
            data-reveal={index > 0 ? "" : undefined}
          >
            <SoftImage
              src={image.url}
              alt={index === 0 ? imageAlt : `${imageAlt} ${index + 1}`}
              fill
              priority={index === 0}
              quality={90}
              sizes="55vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      <div className="lg:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role={hasMultiple ? "region" : undefined}
          tabIndex={hasMultiple ? 0 : undefined}
          aria-label={hasMultiple ? `${imageAlt} gallery` : undefined}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-[var(--color-image-placeholder)]"
            >
              <SoftImage
                src={image.url}
                alt={index === 0 ? imageAlt : `${imageAlt} ${index + 1}`}
                fill
                priority={index === 0}
                quality={90}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {hasMultiple ? (
          <p
            aria-live="polite"
            className="type-caption py-4 text-center font-en tabular-nums tracking-[0.08em]"
          >
            <span className="sr-only">Image </span>
            <span className="text-[var(--color-ink)]">{activeIndex + 1}</span>
            <span aria-hidden className="mx-2 text-[var(--color-ink-faint)]">
              /
            </span>
            <span className="sr-only"> of </span>
            {images.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}
