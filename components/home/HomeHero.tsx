"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { HOME_COPY, HOME_IMAGES } from "@/lib/store-ui/home-redesign";

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

export function HomeHero() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  return (
    <section aria-label="Introduction" className="relative h-screen w-full overflow-hidden">
      {prefersReducedMotion ? (
        <Image
          src={HOME_IMAGES.hero.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HOME_IMAGES.hero.poster}
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        >
          <source src={HOME_IMAGES.hero.video} type="video/mp4" />
        </video>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      <div className="absolute inset-x-0 bottom-0 px-8 pb-20 md:px-16 md:pb-[120px]">
        <div className="mx-auto w-full max-w-7xl space-y-1 md:space-y-2">
          {HOME_COPY.hero.lines.map((line) => (
            <p
              key={line}
              className="text-[12px] font-light leading-[2] tracking-[0.06em] text-[#6c6c6c] md:text-[14px]"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
