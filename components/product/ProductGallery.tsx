"use client";

import Image from "next/image";
import { useState } from "react";
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

  const [activeIndex, setActiveIndex] = useState(
    Math.max(
      0,
      images.findIndex((image) => image.isPrimary),
    ),
  );

  const activeImage = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

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
          <div className="relative aspect-[3/4] w-full lg:aspect-auto lg:h-full lg:flex-1">
            <Image
              src={activeImage.url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 72vw"
              className="object-contain p-4 md:p-8 lg:p-10 xl:p-12"
            />

            {hasMultipleImages ? (
              <span className="absolute bottom-5 right-5 text-[10px] font-light tracking-[0.14em] text-neutral-400 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10">
                {activeIndex + 1}/{images.length}
              </span>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <div className="flex gap-3 overflow-x-auto px-6 pb-6 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {images.map((image, index) => (
                <Thumbnail
                  key={image.id}
                  image={image}
                  index={index}
                  isActive={index === activeIndex}
                  onSelect={() => setActiveIndex(index)}
                  className="h-[4.5rem] w-[3.25rem]"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
