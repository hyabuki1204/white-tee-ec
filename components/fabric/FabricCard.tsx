import Image from "next/image";
import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { FABRIC_IMAGE_ASPECT } from "@/lib/fabric/presentation";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricCardProps = {
  fabric: Fabric;
  variant?: "default" | "entry";
  productCount?: number;
};

export function FabricCard({
  fabric,
  productCount,
}: FabricCardProps) {
  const { fabric: copy } = SITE_UI_COPY;
  const spec = getGaugeSpec(fabric.slug);

  return (
    <article className="group">
      <Link href={`/fabric/${fabric.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-[var(--color-image-placeholder)]",
            FABRIC_IMAGE_ASPECT,
          )}
        >
          <Image
            src={fabric.imageUrl}
            alt={fabric.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)] group-hover:opacity-90"
          />
        </div>

        <div
          className={
            "mt-6 flex flex-col gap-2"
          }
        >
          <h2 className="font-en text-[var(--color-ink)]">
            {spec ? (
              <>
                <span className="text-[64px] font-light leading-[0.85] tracking-[-0.04em] tabular-nums">
                  {spec.gauge}
                  <span className="ml-1 text-[0.3em] font-normal tracking-[0.04em]">
                    G
                  </span>
                </span>
                <span className="ml-3 text-[14px] tracking-[0.08em] text-[var(--color-navy)]">
                  {spec.character}
                </span>
              </>
            ) : (
              fabric.name
            )}
          </h2>
          <p className="type-body text-[var(--color-ink)]">
            {spec ? spec.headlineJa : fabric.tagline}
          </p>
          {spec ? (
            <p className="type-caption">
              {spec.yarn}・{formatWeight(spec)}
            </p>
          ) : null}
          {productCount !== undefined ? (
            <p className="type-caption">
              {copy.pieceCount(productCount)}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
