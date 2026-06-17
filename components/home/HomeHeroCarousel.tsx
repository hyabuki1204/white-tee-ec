"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HOME_HERO_IMAGES,
  HOME_HERO_INTERVAL_MS,
} from "@/lib/store-ui/home-hero";
import { cn } from "@/lib/utils";

export function HomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (HOME_HERO_IMAGES.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HOME_HERO_IMAGES.length);
    }, HOME_HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      aria-label="Featured looks"
      className="relative w-full overflow-hidden bg-[#ececea]"
    >
      <div className="relative aspect-[3/4] w-full sm:aspect-[16/10] md:aspect-[21/9] md:max-h-[72vh]">
        {HOME_HERO_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover object-[center_18%] transition-opacity duration-[1200ms] ease-in-out md:object-[center_22%]",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
      </div>

      <div
        aria-hidden
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-8"
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
    </section>
  );
}
