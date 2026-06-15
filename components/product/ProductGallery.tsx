"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";
import type { Product, ProductImage } from "@/types";

type ProductGalleryProps = {
  product: Product;
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

function isModelImage(index: number): boolean {
  return index === 3 || index === 4;
}

type ThumbnailProps = {
  image: ProductImage;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  className?: string;
};

function Thumbnail({
  image,
  index,
  isActive,
  onSelect,
  className,
}: ThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative shrink-0 overflow-hidden transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-35 hover:opacity-60",
        className,
      )}
      aria-label={`View image ${index + 1}`}
      aria-current={isActive ? "true" : undefined}
    >
      <Image
        src={image.url}
        alt=""
        fill
        sizes="56px"
        className="object-cover"
      />
    </button>
  );
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = resolveImages(product);
  const { product: copy } = SITE_UI_COPY;

  const [activeIndex, setActiveIndex] = useState(
    Math.max(
      0,
      images.findIndex((image) => image.isPrimary),
    ),
  );

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const scrollSyncRef = useRef(false);

  const activeImage = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;
  const showModelCaption = isModelImage(activeIndex);

  const handleMainScroll = useCallback(() => {
    const container = mainScrollRef.current;

    if (!container || scrollSyncRef.current) {
      return;
    }

    const width = container.clientWidth;

    if (width <= 0) {
      return;
    }

    const index = Math.round(container.scrollLeft / width);
    const clamped = Math.min(Math.max(index, 0), images.length - 1);

    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  }, [activeIndex, images.length]);

  useEffect(() => {
    const container = mainScrollRef.current;

    if (!container || !hasMultipleImages) {
      return;
    }

    scrollSyncRef.current = true;
    container.scrollTo({
      left: activeIndex * container.clientWidth,
      behavior: "smooth",
    });

    const timer = window.setTimeout(() => {
      scrollSyncRef.current = false;
    }, 350);

    return () => window.clearTimeout(timer);
  }, [activeIndex, hasMultipleImages]);

  if (!activeImage) {
    return (
      <div className="bg-background lg:sticky lg:top-[var(--header-height)] lg:h-[calc(100vh-var(--header-height))]">
        <div className="flex aspect-[3/4] w-full items-center justify-center lg:aspect-auto lg:h-full">
          <p className="text-xs font-light text-neutral-400">No image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background lg:sticky lg:top-[var(--header-height)] lg:h-[calc(100vh-var(--header-height))]">
      <div className="flex h-full flex-col lg:flex-row lg:items-stretch">
        {hasMultipleImages ? (
          <div className="hidden flex-col gap-3 self-center py-12 pl-6 xl:pl-10 lg:flex">
            {images.map((image, index) => (
              <Thumbnail
                key={image.id}
                image={image}
                index={index}
                isActive={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
                className="h-[4.25rem] w-[3rem]"
              />
            ))}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Mobile: swipeable main gallery */}
          <div
            ref={mainScrollRef}
            onScroll={handleMainScroll}
            className={cn(
              "flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden",
              hasMultipleImages ? "" : "w-full",
            )}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-[3/4] w-full shrink-0 snap-center"
              >
                <Image
                  src={image.url}
                  alt={product.name}
                  fill
                  priority={index === activeIndex}
                  sizes="100vw"
                  className="object-contain p-4 md:p-8"
                />
                {isModelImage(index) ? (
                  <span className="absolute bottom-5 left-5 text-[11px] font-light tracking-[0.12em] text-neutral-400 md:bottom-8 md:left-8">
                    {copy.modelCaption}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Desktop: single active image */}
          <div className="relative hidden aspect-[3/4] w-full lg:block lg:aspect-auto lg:h-full lg:flex-1">
            <Image
              src={activeImage.url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 72vw"
              className="object-contain p-4 md:p-8 lg:p-10 xl:p-12"
            />

            {hasMultipleImages ? (
              <span className="absolute bottom-5 right-5 text-[11px] font-light tracking-[0.14em] text-neutral-400 md:bottom-8 md:right-8 md:text-[10px] lg:bottom-10 lg:right-10">
                {activeIndex + 1}/{images.length}
              </span>
            ) : null}

            {showModelCaption ? (
              <span className="absolute bottom-5 left-5 text-[11px] font-light tracking-[0.12em] text-neutral-400 md:bottom-8 md:left-8 md:text-[10px] lg:bottom-10 lg:left-10">
                {copy.modelCaption}
              </span>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <>
              <p className="px-6 pt-2 text-center text-[10px] font-light tracking-[0.08em] text-neutral-400 lg:hidden">
                {copy.gallerySwipeHint}
              </p>
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 pb-6 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
                {images.map((image, index) => (
                  <Thumbnail
                    key={image.id}
                    image={image}
                    index={index}
                    isActive={index === activeIndex}
                    onSelect={() => setActiveIndex(index)}
                    className="h-[4.5rem] w-[3.25rem] snap-start"
                  />
                ))}
              </div>
              <span className="px-6 pb-4 text-center text-[11px] font-light tracking-[0.14em] text-neutral-400 lg:hidden">
                {activeIndex + 1}/{images.length}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
