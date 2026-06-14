import Image from "next/image";
import Link from "next/link";
import { FABRIC_IMAGE_ASPECT, getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricCardProps = {
  fabric: Fabric;
  variant?: "default" | "entry";
};

export function FabricCard({ fabric, variant = "default" }: FabricCardProps) {
  const isEntry = variant === "entry";
  const presentation = getFabricPresentation(fabric.slug);

  return (
    <article className="group">
      <Link href={`/fabric/${fabric.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-background",
            FABRIC_IMAGE_ASPECT,
          )}
        >
          <Image
            src={fabric.imageUrl}
            alt={fabric.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center brightness-[0.97] contrast-[0.98] transition-transform duration-[850ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.015]"
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
                ? "text-[12px] font-light tracking-[0.1em] text-neutral-800 transition-opacity duration-[850ms] ease-out delay-75 group-hover:opacity-45"
                : "text-[11px] font-light tracking-[0.11em] text-neutral-800 transition-opacity duration-[850ms] ease-out delay-75 group-hover:opacity-45"
            }
          >
            {fabric.name}
          </h2>
          <p
            className={cn(
              "text-[12px] font-light leading-[1.9] text-neutral-500 transition-opacity duration-[850ms] ease-out delay-100 group-hover:opacity-60 md:text-[11px] md:text-neutral-400",
              presentation.taglineTracking,
            )}
          >
            {fabric.tagline}
          </p>
        </div>
      </Link>
    </article>
  );
}
