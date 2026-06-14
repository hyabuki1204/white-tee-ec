import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Fabric } from "@/lib/fabric/content";

type ProductFabricLinkProps = {
  fabric: Fabric;
};

export function ProductFabricLink({ fabric }: ProductFabricLinkProps) {
  return (
    <section aria-label="Fabric">
      <Container as="div" className="py-16 md:py-20 lg:py-28">
        <Link
          href={`/fabric/${fabric.slug}`}
          className="group grid grid-cols-1 items-center gap-12 md:gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-background sm:aspect-[5/4] lg:aspect-[4/3]">
            <Image
              src={fabric.imageUrl}
              alt={fabric.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center brightness-[0.97] contrast-[0.98] transition-transform duration-[850ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.015]"
            />
          </div>

          <div className="flex flex-col gap-6 md:gap-8 lg:py-6 xl:py-10">
            <p className="text-[10px] font-light tracking-[0.14em] text-neutral-400">
              This product belongs to
            </p>

            <div className="space-y-4 md:space-y-5">
              <h2 className="text-sm font-light tracking-[0.12em] text-neutral-800 transition-opacity duration-500 group-hover:opacity-50 md:text-base">
                {fabric.name}
              </h2>
              <p className="max-w-md text-xs font-light leading-[2.1] tracking-[0.03em] text-neutral-500">
                {fabric.tagline}
              </p>
            </div>

            <p className="max-w-lg text-xs font-light leading-[2.15] tracking-[0.03em] text-neutral-400">
              {fabric.descriptionLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < fabric.descriptionLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>

            <p className="text-[11px] font-light tracking-[0.08em] text-neutral-500 transition-opacity duration-500 group-hover:opacity-50">
              View fabric
            </p>
          </div>
        </Link>
      </Container>
    </section>
  );
}
