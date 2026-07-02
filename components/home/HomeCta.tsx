import Link from "next/link";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";

type HomeCtaProps = {
  productHref: string;
};

export function HomeCta({ productHref }: HomeCtaProps) {
  return (
    <section aria-label="Shop" className="border-t border-[#e8e8e6]">
      <div className="mx-auto flex w-full max-w-7xl justify-center px-8 py-16 md:px-16 md:py-24">
        <Link
          href={productHref}
          className="border border-[#c8c8c6] px-16 py-4 text-[12px] font-light tracking-[0.2em] text-[#505050] transition-opacity duration-300 hover:opacity-60"
        >
          {HOME_COPY.cta.label}
        </Link>
      </div>
    </section>
  );
}
