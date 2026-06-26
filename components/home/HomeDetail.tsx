import Image from "next/image";
import { HOME_COPY, HOME_IMAGES } from "@/lib/store-ui/home-redesign";

const DETAIL_VIEWS = [
  { src: HOME_IMAGES.detail.front, alt: "Front view" },
  { src: HOME_IMAGES.detail.side, alt: "Side view" },
  { src: HOME_IMAGES.detail.full, alt: "Full body view" },
] as const;

export function HomeDetail() {
  const { model, material } = HOME_COPY.detail;

  return (
    <section aria-label="Fit and material detail" className="border-t border-[#e8e8e6]">
      <div className="mx-auto w-full max-w-7xl px-8 py-16 md:px-16 md:py-[120px]">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {DETAIL_VIEWS.map((view) => (
            <div
              key={view.src}
              className="relative aspect-[3/4] overflow-hidden bg-[#f4f4f2]"
            >
              <Image
                src={view.src}
                alt={view.alt}
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-8 sm:mt-16 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-[11px] font-light tracking-[0.08em] text-[#6c6c6c] md:text-[12px]">
            {model.height}
            <span className="mx-3 text-[#c8c8c6]">/</span>
            {model.size}
          </p>

          <div className="sm:max-w-xs sm:text-right">
            {material.map((line) => (
              <p
                key={line}
                className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-[#6c6c6c]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
