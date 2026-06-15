import Image from "next/image";
import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type HeroSectionProps = {
  heroImage: string;
  heroCopy: string;
};

export function HeroSection({ heroImage, heroCopy }: HeroSectionProps) {
  const { home: copy } = SITE_UI_COPY;

  return (
    <section aria-label="Hero" className="w-full">
      <div className="relative h-[68vh] min-h-[22rem] w-full sm:h-[72vh] md:h-[72vh] lg:h-[75vh]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%] brightness-[0.96] contrast-[0.98]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-background from-15% via-background/70 via-50% to-transparent md:h-[22%] md:from-20% md:via-background/30 md:via-60%"
        />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-6 pb-12 sm:pb-14 md:hidden">
          <h1 className="text-center text-[16px] font-light leading-[1.65] tracking-[0.12em] text-neutral-800 sm:text-[15px]">
            {heroCopy}
          </h1>
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.1em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
          >
            {copy.exploreFabric}
          </Link>
        </div>
      </div>
    </section>
  );
}
