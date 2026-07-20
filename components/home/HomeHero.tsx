"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";
import {
  HOME_HERO_CROSSFADE_MS,
  HOME_HERO_IMAGES,
  HOME_HERO_INTERVAL_MS,
} from "@/lib/store-ui/home-hero";
import { cn } from "@/lib/utils";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type HomeHeroProps = {
  priceRange: string;
};

export function HomeHero({ priceRange }: HomeHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const imageCount = HOME_HERO_IMAGES.length;
  const copy = HOME_COPY.hero;

  useEffect(() => {
    if (prefersReducedMotion || imageCount <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageCount);
    }, HOME_HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [imageCount, prefersReducedMotion]);

  return (
    <section
      aria-label="Introduction"
      className="flex w-full flex-col bg-[var(--color-bg)] md:min-h-[min(72vh,760px)] md:flex-row"
    >
      {/* Text panel — desktop left / mobile below photo */}
      <div className="order-2 flex w-full flex-col justify-center px-[var(--space-4)] py-[var(--space-5)] md:order-1 md:w-[38%] md:px-[var(--space-5)] md:py-[var(--space-6)] lg:px-[var(--space-6)]">
        <p className="type-label">{copy.label}</p>

        <h1 className="type-display mt-[var(--space-3)] max-w-[16em]">
          {copy.headline}
        </h1>

        <p className="type-body mt-[var(--space-2)] max-w-[22em] text-[var(--color-ink-soft)]">
          {copy.subline}
        </p>

        <p className="type-caption mt-[var(--space-3)] font-en tracking-[0.04em]">
          {priceRange}
        </p>

        <Link
          href="#products"
          className="type-caption mt-[var(--space-4)] inline-flex w-fit items-center justify-center border border-[var(--color-ink)] px-10 py-4 tracking-[var(--tracking-wide)] text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]"
        >
          {copy.shopCta}
        </Link>
      </div>

      {/* Image panel — desktop right / mobile top */}
      <div className="relative order-1 aspect-[4/5] w-full overflow-hidden bg-[var(--color-bg-warm)] md:order-2 md:aspect-auto md:min-h-[min(72vh,760px)] md:w-[62%]">
        {HOME_HERO_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 62vw"
            className={cn(
              "object-cover object-[center_18%]",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
            style={{
              transitionProperty: "opacity",
              transitionDuration: `${HOME_HERO_CROSSFADE_MS}ms`,
              transitionTimingFunction: "var(--ease-quiet)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
