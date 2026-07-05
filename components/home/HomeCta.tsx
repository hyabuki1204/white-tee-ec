import Link from "next/link";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";

type HomeCtaProps = {
  productHref?: string;
};

export function HomeCta({ productHref }: HomeCtaProps) {
  return (
    <section aria-label="Shop" className="border-t border-[#e8e8e6]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-8 py-16 md:flex-row md:justify-center md:gap-6 md:px-16 md:py-20">
        <Link
          href="/products?sleeve=short"
          className="inline-flex min-h-12 items-center justify-center border border-neutral-800 px-10 py-3.5 text-[12px] font-light tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          {HOME_COPY.cta.label}
        </Link>
        {productHref ? (
          <Link
            href={productHref}
            className="inline-flex min-h-12 items-center justify-center px-6 py-3.5 text-[12px] font-light tracking-[0.12em] text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60"
          >
            おすすめモデルを見る
          </Link>
        ) : null}
      </div>
    </section>
  );
}
