"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";
import {
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

export function HomeHero({ priceRange }: { priceRange: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const imageCount = HOME_HERO_IMAGES.length;

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + imageCount) % imageCount);
  }, [imageCount]);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % imageCount);
  }, [imageCount]);

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
      className="group relative h-[min(68vh,720px)] min-h-[360px] w-full overflow-hidden bg-[#ececea] md:min-h-[420px]"
    >
      {HOME_HERO_IMAGES.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          className={cn(
            "object-cover object-[center_20%] transition-opacity duration-[1200ms] ease-in-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/85" />

      {imageCount > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={goToPrevious}
            className="absolute inset-y-0 left-0 z-10 w-[18%] min-w-[3rem] max-w-[6rem] cursor-pointer transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-neutral-400 md:w-[14%]"
          >
            <span
              aria-hidden
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-light tracking-[0.08em] text-neutral-600 opacity-40 transition-opacity duration-300 group-hover:opacity-70 md:left-6 md:text-[20px]"
            >
              ←
            </span>
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={goToNext}
            className="absolute inset-y-0 right-0 z-10 w-[18%] min-w-[3rem] max-w-[6rem] cursor-pointer transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-neutral-400 md:w-[14%]"
          >
            <span
              aria-hidden
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] font-light tracking-[0.08em] text-neutral-600 opacity-40 transition-opacity duration-300 group-hover:opacity-70 md:right-6 md:text-[20px]"
            >
              →
            </span>
          </button>

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[88px] left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-[104px]"
          >
            {HOME_HERO_IMAGES.map((src, index) => (
              <span
                key={src}
                className={cn(
                  "h-[5px] w-[5px] rounded-full bg-neutral-400 transition-opacity duration-500",
                  index === activeIndex ? "opacity-80" : "opacity-25",
                )}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-10 md:px-16 md:pb-14">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 md:space-y-2">
            {HOME_COPY.hero.lines.map((line) => (
              <p
                key={line}
                className="text-[14px] font-light leading-[1.85] tracking-[0.06em] text-[#505050] md:text-[15px]"
              >
                {line}
              </p>
            ))}
            <p className="text-[14px] font-light leading-[1.85] tracking-[0.06em] text-[#505050] md:text-[15px]">
              {priceRange} — 素材・縫製・仕上げにこだわった一着。
            </p>
          </div>

          <Link
            href="#products"
            className="inline-flex min-h-11 shrink-0 items-center justify-center border border-neutral-800 px-8 py-3 text-[12px] font-light tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            {HOME_COPY.hero.shopCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
