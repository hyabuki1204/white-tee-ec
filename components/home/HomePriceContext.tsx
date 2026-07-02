import Image from "next/image";
import {
  CREDIBILITY_IMAGES,
  EDITORIAL_VOICES,
  PRICE_POSITIONING,
} from "@/lib/store-ui/credibility";

export function HomePriceContext() {
  return (
    <section aria-label="Price context" className="border-t border-[#e8e8e6]">
      <div className="mx-auto w-full max-w-7xl px-8 py-20 md:px-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f4f2]">
            <Image
              src={CREDIBILITY_IMAGES.craft}
              alt="襟と生地の検品"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-[12px] font-light tracking-[0.2em] text-[#7a7a7a]">
              {PRICE_POSITIONING.headline}
            </h2>
            <p className="text-[13px] font-light leading-[2] tracking-[0.04em] text-[#505050] md:text-[15px]">
              {PRICE_POSITIONING.intro}
            </p>
            <div className="space-y-2">
              {PRICE_POSITIONING.lines.map((line) => (
                <p
                  key={line}
                  className="text-[12px] font-light leading-[1.95] tracking-[0.04em] text-[#505050]"
                >
                  {line}
                </p>
              ))}
            </div>
            <p className="text-[12px] font-light leading-[1.9] tracking-[0.04em] text-[#7a7a7a]">
              {PRICE_POSITIONING.range}
            </p>
            <p className="text-[12px] font-light leading-[1.9] tracking-[0.04em] text-[#7a7a7a]">
              {PRICE_POSITIONING.care}
            </p>

            <blockquote className="border-l border-[#e8e8e6] pl-4">
              <p className="text-[12px] font-light leading-[1.9] tracking-[0.04em] text-[#505050]">
                {EDITORIAL_VOICES[1]?.line}
              </p>
              <cite className="mt-2 block text-[11px] font-light not-italic tracking-[0.1em] text-[#7a7a7a]">
                {EDITORIAL_VOICES[1]?.source}
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
