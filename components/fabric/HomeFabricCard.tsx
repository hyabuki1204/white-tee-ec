import Image from "next/image";
import Link from "next/link";
import { getFabricPresentation } from "@/lib/fabric/presentation";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type HomeFabricCardProps = {
  fabric: Fabric;
  className?: string;
};

const IMAGE_TRANSITION =
  "transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

export function HomeFabricCard({ fabric, className }: HomeFabricCardProps) {
  const presentation = getFabricPresentation(fabric.slug);

  return (
    <article className={cn("group", className)}>
      <Link href={`/fabric/${fabric.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f2]">
          <Image
            src={fabric.imageUrl}
            alt={fabric.imageAlt}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover brightness-[0.97] contrast-[0.98]",
              presentation.heroImagePosition,
              IMAGE_TRANSITION,
              "[@media(hover:hover)]:group-hover:scale-[1.02]",
            )}
          />

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/25 to-transparent px-4 pb-4 pt-20",
              "opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100",
              "[@media(hover:none)]:opacity-100 [@media(hover:none)]:from-neutral-900/45",
            )}
          >
            <p className="text-[11px] font-light tracking-[0.12em] text-white/85">
              {GRAPHPAPER_STORE_COPY.home.sectionFabric}
            </p>
            <p className="mt-1 text-[12px] font-light leading-snug tracking-[0.06em] text-white">
              {fabric.name}
            </p>
            <p
              className={cn(
                "mt-2 text-[12px] font-light leading-relaxed text-white/85",
                presentation.taglineTracking,
              )}
            >
              {fabric.tagline}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
