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
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[21/9]">
        <Image
          src={fabric.imageUrl}
          alt={fabric.imageAlt}
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover",
            presentation.heroImagePosition,
          )}
        />
      </div>

      <div className="px-6 py-10 text-center sm:py-12 md:py-14">
        <h1 className="text-[14px] font-light tracking-[0.2em] text-neutral-800 md:text-[14px]">
          {fabric.name}
        </h1>
        <p
          className={cn(
            "mx-auto mt-5 max-w-sm text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:mt-6 md:text-[13px] md:leading-[2.05]",
            presentation.taglineTracking,
          )}
        >
          {fabric.tagline}
        </p>
      </div>
    </section>
  );
}
