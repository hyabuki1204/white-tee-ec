import Image from "next/image";
import Link from "next/link";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";
import type { HomeDetailContent } from "@/lib/store-ui/home-featured";

type HomeDetailProps = {
  detail: HomeDetailContent;
};

export function HomeDetail({ detail }: HomeDetailProps) {
  const { productName, productHref, model, material, specs, views } = detail;

  return (
    <section aria-label="Fit and material detail" className="border-t border-[#e8e8e6]">
      <div className="mx-auto w-full max-w-7xl px-8 py-20 md:px-16 md:py-32">
        <header className="mb-8 md:mb-12">
          <Link
            href={productHref}
            className="text-[11px] font-light tracking-[0.12em] text-[#6c6c6c] transition-opacity hover:opacity-60 md:text-[12px]"
          >
            {productName}
          </Link>
          <p className="mt-2 text-[11px] font-light tracking-[0.08em] text-[#9a9a9a]">
            {HOME_COPY.detail.caption}
          </p>
        </header>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {views.map((view) => (
            <div
              key={view.src}
              className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f2]"
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

        <div className="mt-12 flex flex-col gap-12 sm:mt-16 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-light tracking-[0.08em] text-[#6c6c6c] md:text-[12px]">
              {model.height}
              <span className="mx-3 text-[#c8c8c6]">/</span>
              {model.size}
            </p>
            <p className="mt-4 text-[11px] font-light tracking-[0.04em] text-[#9a9a9a]">
              {material}
            </p>
          </div>

          <dl className="grid gap-6 sm:max-w-sm md:text-right">
            {specs.map((spec) => (
              <div key={spec.label} className="grid gap-1">
                <dt className="text-[11px] font-light tracking-[0.12em] text-[#9a9a9a]">
                  {spec.label}
                </dt>
                <dd className="text-[11px] font-light tracking-[0.04em] text-[#6c6c6c] md:text-[12px]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
