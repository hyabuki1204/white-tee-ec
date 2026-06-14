import Image from "next/image";
import { getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricHeroProps = {
  fabric: Fabric;
};

export function FabricHero({ fabric }: FabricHeroProps) {
  const presentation = getFabricPresentation(fabric.slug);

  return (
    <section aria-label={fabric.name} className="w-full">
      <div className="relative h-[56vh] min-h-[20rem] w-full sm:min-h-[22rem] md:h-[70vh] lg:h-[78vh]">
        <Image
          src={fabric.imageUrl}
          alt={fabric.imageAlt}
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover brightness-[0.96] contrast-[0.98]",
            presentation.heroImagePosition,
          )}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-background from-15% via-background/70 via-50% to-transparent md:h-[55%] md:via-background/60"
        />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-12 sm:pb-14 md:pb-16 lg:pb-20">
          <h1 className="text-[13px] font-light tracking-[0.12em] text-neutral-800 md:text-xs md:tracking-[0.14em]">
            {fabric.name}
          </h1>
          <p
            className={cn(
              "mt-5 max-w-xs text-center text-[13px] font-light leading-[1.95] text-neutral-600 sm:mt-7 md:mt-8 md:text-xs md:leading-[2.05] md:text-neutral-500",
              presentation.taglineTracking,
            )}
          >
            {fabric.tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
