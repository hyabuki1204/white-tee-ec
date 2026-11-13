import Image from "next/image";
import type { CSSProperties } from "react";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import type { Fabric } from "@/lib/fabric/content";

type FabricHeroProps = {
  fabric: Fabric;
};

export function FabricHero({ fabric }: FabricHeroProps) {
  const spec = getGaugeSpec(fabric.slug);

  return (
    <section
      aria-label={fabric.name}
      className="grid w-full bg-[var(--color-ground)] lg:grid-cols-2"
    >
      <div className="relative aspect-[4/3] w-full bg-[var(--color-image-placeholder)] lg:aspect-auto lg:min-h-[min(78svh,760px)]">
        <Image
          src={fabric.imageUrl}
          alt={fabric.imageAlt}
          fill
          preload
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 xl:px-24">
        <p className="type-label !text-[var(--color-navy)]">
          Gauge{spec ? ` — ${spec.character}` : ""}
        </p>

        {spec ? (
          <h1 className="mt-4">
            <span className="type-numeral block text-[var(--color-ink)]">
              {spec.gauge}
              <small>G</small>
            </span>
            <span className="type-h2 mt-6 block">{spec.headlineJa}</span>
          </h1>
        ) : (
          <h1 className="type-display mt-4">{fabric.name}</h1>
        )}

        {spec ? (
          <>
            <div className="mt-5 max-w-[30em] space-y-1">
              {spec.linesJa.map((line) => (
                <p key={line} className="type-body text-[var(--color-ink-soft)]">
                  {line}
                </p>
              ))}
            </div>

            <div className="mt-8 max-w-md">
              <div
                className="needle-ruler h-10 border-x border-[var(--color-ink)] text-[var(--color-ink)]"
                style={{ "--gauge": spec.gauge } as CSSProperties}
                aria-hidden
              />
              <p className="type-caption mt-2 flex justify-between">
                <span className="font-en">1 inch</span>
                <span>
                  針
                  <span className="font-en mx-1 text-[var(--color-ink)] tabular-nums">
                    {spec.gauge}
                  </span>
                  本
                </span>
              </p>
            </div>

            <dl className="mt-8 max-w-md border-t border-[var(--color-hairline)]">
              {[
                ["糸", spec.yarn],
                ["組織", spec.structure],
                ["目付", formatWeight(spec)],
                ["混率", "綿 100%"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex gap-6 border-b border-[var(--color-hairline)] py-3"
                >
                  <dt className="type-body w-16 shrink-0 text-[var(--color-ink-soft)]">
                    {label}
                  </dt>
                  <dd className="type-body text-[var(--color-ink)]">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="type-body mt-5 text-[var(--color-ink-soft)]">
            {fabric.tagline}
          </p>
        )}
      </div>
    </section>
  );
}
