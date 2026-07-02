import Image from "next/image";
import type { PdpValueContent } from "@/lib/store-ui/pdp-value";
import { PRICE_POSITIONING } from "@/lib/store-ui/credibility";

type ProductValuePropositionProps = {
  content: PdpValueContent;
};

export function ProductValueProposition({
  content,
}: ProductValuePropositionProps) {
  return (
    <section aria-label={content.headline} className="space-y-5 border-t border-neutral-200/50 pt-6">
      <h2 className="text-[11px] font-light uppercase tracking-[0.16em] text-neutral-600">
        {content.headline}
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {content.images.map((image) => (
          <div
            key={image.src}
            className="relative aspect-[4/3] overflow-hidden bg-[#f4f4f2]"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 40vw, 120px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {content.lines.map((line) => (
          <p
            key={line}
            className="text-[11px] font-light leading-[1.95] tracking-[0.04em] text-neutral-600"
          >
            {line}
          </p>
        ))}
      </div>

      <div className="space-y-1.5">
        {content.construction.map((line) => (
          <p
            key={line}
            className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600"
          >
            {line}
          </p>
        ))}
      </div>

      {content.priceNote ? (
        <p className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600">
          {content.priceNote}
        </p>
      ) : null}

      <p className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600">
        {PRICE_POSITIONING.range}
      </p>

      <dl className="grid gap-3 pt-1">
        {content.specs.map((spec) => (
          <div key={spec.label} className="grid gap-0.5">
            <dt className="text-[11px] font-light tracking-[0.1em] text-neutral-600">
              {spec.label}
            </dt>
            <dd className="text-[11px] font-light tracking-[0.04em] text-neutral-600">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
