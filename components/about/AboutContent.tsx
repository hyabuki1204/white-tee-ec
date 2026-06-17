import Link from "next/link";
import Image from "next/image";
import type { AboutPageContent } from "@/types/site-content";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type AboutContentProps = Pick<
  AboutPageContent,
  "headline" | "bodyParagraphs" | "helperJa"
>;

const ABOUT_HERO = {
  src: "/store/about/about-hero.jpg",
  alt: "WHITE TEE atelier — knitting and cotton",
} as const;

export function AboutContent({
  headline,
  bodyParagraphs,
  helperJa,
}: AboutContentProps) {
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <>
      <section className="relative aspect-[16/10] overflow-hidden bg-[#f4f4f2] sm:aspect-[21/9]">
        <Image
          src={ABOUT_HERO.src}
          alt={ABOUT_HERO.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.97] contrast-[0.98]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/35 via-transparent to-transparent" />
      </section>

      <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20 md:py-28 lg:py-32">
        <h1 className="text-[13px] font-light tracking-[0.28em] text-neutral-800 md:text-[14px]">
          {headline}
        </h1>

        <div className="mt-12 flex flex-col gap-8 sm:mt-16 sm:gap-10 md:mt-20 md:gap-12">
          {bodyParagraphs.map((paragraph) => (
            <p
              key={paragraph[0]}
              className="text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:text-[12px] md:leading-[2.1] md:tracking-[0.03em]"
            >
              {paragraph.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < paragraph.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          ))}
        </div>

        {helperJa ? (
          <JaHelperText spacing="loose" className="mx-auto max-w-sm">
            {helperJa}
          </JaHelperText>
        ) : null}

        <div className="mt-16 flex flex-col items-center gap-4 md:mt-20">
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-500 transition-opacity duration-300 hover:opacity-60"
          >
            {copy.exploreFabric}
          </Link>
          <Link
            href="/stockist"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
          >
            Stockist →
          </Link>
        </div>
      </div>
    </>
  );
}
