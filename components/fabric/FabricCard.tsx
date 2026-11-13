import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import type { Locale } from "@/lib/i18n/config";
import { joinSpec } from "@/lib/i18n/format";
import { FABRIC_IMAGE_ASPECT } from "@/lib/fabric/presentation";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricCardProps = {
  locale: Locale;
  fabric: Fabric;
  variant?: "default" | "entry";
  productCount?: number;
};

export function FabricCard({
  locale,
  fabric,
  productCount,
}: FabricCardProps) {
  const { fabric: copy } = getSiteUiCopy(locale);
  const spec = getGaugeSpec(fabric.slug, locale);

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
            {spec ? spec.headline : fabric.tagline}
          </p>
          {spec ? (
            <p className="type-caption">
              {joinSpec(locale, spec.yarn, formatWeight(spec))}
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
