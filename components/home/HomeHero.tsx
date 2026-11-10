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

/** Split after "、" so each phrase stays whole (copy text is unchanged). */
function splitPhrases(text: string) {
  return text.split(/(?<=、)/);
}

type HomeHeroProps = {
  priceRange: string;
};

export function HomeHero({ priceRange }: HomeHeroProps) {
  /** `reached` = highest slide shown so far; later slides mount only when needed. */
  const [slide, setSlide] = useState({ active: 0, reached: 0 });
  const activeIndex = slide.active;
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
      setSlide(({ active, reached }) => {
        const next = (active + 1) % imageCount;
        return { active: next, reached: Math.max(reached, next) };
      });
    }, HOME_HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [imageCount, prefersReducedMotion]);

  // Mount the slides already shown plus the next one (preloaded off-screen),
  // so only the first image competes for LCP.
  const mountedCount = prefersReducedMotion
    ? 1
    : Math.min(imageCount, slide.reached + 2);

  return (
    <section
      aria-label="Introduction"
      className="flex w-full flex-col bg-[var(--color-surface)] md:min-h-[min(84svh,820px)] md:flex-row"
    >
      {/* Text panel — desktop left / mobile below photo */}
      <div className="order-2 flex w-full flex-col justify-center px-[var(--space-4)] py-[var(--space-5)] md:order-1 md:w-[38%] md:px-[var(--space-5)] md:py-[var(--space-6)] xl:px-[var(--space-6)]">
        <p className="type-label">{copy.label}</p>

        <h1 className="type-display mt-[var(--space-3)] max-w-[12em]">
          {splitPhrases(copy.headline).map((phrase) => (
            <span key={phrase} className="inline-block">
              {phrase}
            </span>
          ))}
        </h1>

        <p className="type-body mt-[var(--space-2)] max-w-[22em] text-[var(--color-ink-soft)]">
          {copy.subline}
        </p>

        <p className="type-caption mt-[var(--space-3)] font-en tabular-nums tracking-[0.04em]">
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
      <div className="relative order-1 aspect-[4/5] w-full overflow-hidden bg-[var(--color-image-placeholder)] md:order-2 md:aspect-auto md:min-h-[min(84svh,820px)] md:w-[62%]">
        {HOME_HERO_IMAGES.slice(0, mountedCount).map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            preload={index === 0}
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
