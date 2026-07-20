import Image from "next/image";
import Link from "next/link";
import { getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type HomeFabricCardProps = {
  fabric: Fabric;
  className?: string;
};

export function HomeFabricCard({ fabric, className }: HomeFabricCardProps) {
  const presentation = getFabricPresentation(fabric.slug);

  return (
    <article className={cn("group", className)}>
      <Link href={`/fabric/${fabric.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-image-placeholder)]">
          <Image
            src={fabric.imageUrl}
            alt={fabric.imageAlt}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)] [@media(hover:hover)]:group-hover:opacity-90",
              presentation.heroImagePosition,
            )}
          />
        </div>
        <p className="type-label mt-3 text-[var(--color-ink)]">{fabric.name}</p>
        <p
          className={cn(
            "type-caption mt-1",
            presentation.taglineTracking,
          )}
        >
          {fabric.tagline}
        </p>
      </Link>
    </article>
  );
}
