"use client";

import { SoftImage } from "@/components/motion/SoftImage";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
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
  const syncingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || syncingRef.current || !hasMultiple) return;

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

  const goTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    syncingRef.current = true;
    setActiveIndex(index);
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      syncingRef.current = false;
    }, 350);
  }, []);

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
          <div
            className="flex items-center justify-center gap-1.5 py-4"
            role="tablist"
            aria-label="Gallery pagination"
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Image ${index + 1}`}
                onClick={() => goTo(index)}
                className={cn(
                  "h-1 w-1 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
                  index === activeIndex
                    ? "bg-[var(--color-ink-soft)] opacity-100"
                    : "bg-[var(--color-ink-faint)] opacity-50",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
