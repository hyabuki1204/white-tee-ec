import Image from "next/image";
import Link from "next/link";
import { FabricCharacterTraitLine } from "@/components/fabric/FabricCharacterTraitLine";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { FABRIC_IMAGE_ASPECT, getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricCardProps = {
  fabric: Fabric;
  variant?: "default" | "entry";
  productCount?: number;
};

export function FabricCard({
  fabric,
  variant = "default",
  productCount,
}: FabricCardProps) {
  const isEntry = variant === "entry";
  const presentation = getFabricPresentation(fabric.slug);
  const { fabric: copy } = SITE_UI_COPY;

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
            className="object-cover object-center brightness-[0.97] contrast-[0.98] transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)] group-hover:opacity-90"
          />
        </div>

        <div
          className={
            isEntry
              ? "mt-9 flex flex-col gap-2.5 md:mt-10"
              : "mt-9 flex flex-col gap-2 md:mt-10 lg:mt-11"
          }
        >
          <h2
            className={
              isEntry
                ? "text-[14px] font-normal tracking-[0.1em] text-neutral-800 transition-opacity duration-[var(--duration-reveal)] ease-out delay-75 group-hover:opacity-45"
                : "text-[12px] font-normal tracking-[0.11em] text-neutral-800 transition-opacity duration-[var(--duration-reveal)] ease-out delay-75 group-hover:opacity-45"
            }
          >
            {fabric.name}
          </h2>
          <p
            className={cn(
              "text-[14px] font-normal leading-[1.9] text-neutral-600 transition-opacity duration-[var(--duration-reveal)] ease-out delay-100 group-hover:opacity-60 md:text-[14px] md:text-neutral-600",
              presentation.taglineTracking,
            )}
          >
            {fabric.tagline}
          </p>
          {productCount !== undefined ? (
            <p className="text-[11px] font-normal tracking-[0.08em] text-neutral-600">
              {copy.pieceCount(productCount)}
            </p>
          ) : null}
          <FabricCharacterTraitLine
            trait="thickness"
            level={fabric.character.thickness}
            align="start"
            className="pt-1"
          />
          {fabric.taglineJa ? (
            <JaHelperText spacing="tight" className="!mt-2 max-w-none">
              {fabric.taglineJa}
            </JaHelperText>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
