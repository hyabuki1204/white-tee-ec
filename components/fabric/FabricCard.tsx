import Image from "next/image";
import Link from "next/link";
import type { Fabric } from "@/lib/fabric/content";

type FabricCardProps = {
  fabric: Fabric;
};

export function FabricCard({ fabric }: FabricCardProps) {
  return (
    <article className="group">
      <Link href={`/fabric/${fabric.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-background">
          <Image
            src={fabric.imageUrl}
            alt={fabric.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center brightness-[0.97] contrast-[0.98] transition-transform duration-[850ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.015]"
          />
        </div>

        <div className="mt-8 flex flex-col gap-2 md:mt-9">
          <h2 className="text-[11px] font-light tracking-[0.1em] text-neutral-800 transition-opacity duration-[850ms] ease-out delay-75 group-hover:opacity-45">
            {fabric.name}
          </h2>
          <p className="text-[11px] font-light leading-[1.85] tracking-[0.02em] text-neutral-400 transition-opacity duration-[850ms] ease-out delay-100 group-hover:opacity-60">
            {fabric.tagline}
          </p>
        </div>
      </Link>
    </article>
  );
}
