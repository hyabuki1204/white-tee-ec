import Link from "next/link";
import Image from "next/image";
import { JaHelperText } from "@/components/ui/JaHelperText";
import type { AboutPageContent } from "@/types/site-content";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type AboutContentProps = Pick<
  AboutPageContent,
  "headline" | "headlineJa" | "bodyParagraphs" | "bodyParagraphsJa" | "helperJa"
>;

const ABOUT_HERO = {
  src: "/store/about/about-hero.jpg",
  alt: "WHITE TEE atelier — knitting and cotton",
} as const;

function ParagraphBlock({
  lines,
  lang,
  className,
}: {
  lines: string[];
  lang?: "ja";
  className?: string;
}) {
  return (
    <p
      lang={lang}
      className={
        className ??
        "type-body text-[var(--color-ink-soft)]"
      }
    >
      {lines.map((line, index) => (
        <span key={line}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

export function AboutContent({
  headline,
  headlineJa,
  bodyParagraphs,
  bodyParagraphsJa,
  helperJa,
}: AboutContentProps) {
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <>
      <section className="relative aspect-[16/10] overflow-hidden bg-[var(--color-image-placeholder)] sm:aspect-[21/9]">
        <Image
          src={ABOUT_HERO.src}
          alt={ABOUT_HERO.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.97] contrast-[0.98]"
        />
      </section>

      <div className="mx-auto max-w-2xl px-6 py-[var(--space-6)] text-center md:py-[var(--space-7)]">
        <h1 className="text-[14px] font-normal tracking-[0.28em] text-neutral-800 md:text-[14px]">
          {headline}
        </h1>
        {headlineJa ? (
          <JaHelperText spacing="default" className="mx-auto max-w-sm">
            {headlineJa}
          </JaHelperText>
        ) : null}

        <div className="mt-12 flex flex-col gap-8 sm:mt-16 sm:gap-10 md:mt-20 md:gap-12">
          {bodyParagraphs.map((paragraph, index) => {
            const paragraphJa = bodyParagraphsJa?.[index];

            return (
              <div key={paragraph[0]} className="space-y-4">
                <ParagraphBlock lines={paragraph} />
                {paragraphJa ? (
                  <ParagraphBlock
                    lines={paragraphJa}
                    lang="ja"
                    className="text-[14px] font-normal leading-[2.05] tracking-[0.03em] text-neutral-600 md:text-[14px] md:leading-[2.15]"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {helperJa ? (
          <JaHelperText spacing="loose" className="mx-auto max-w-sm">
            {helperJa}
          </JaHelperText>
        ) : null}

        <div className="mt-16 flex flex-col items-center gap-4 md:mt-20">
          <Link
            href="/fabric"
            className="text-[12px] font-normal tracking-[0.08em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
          >
            {copy.exploreFabric}
          </Link>
          <Link
            href="/stockist"
            className="text-[12px] font-normal tracking-[0.08em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
          >
            Stockist →
          </Link>
        </div>
      </div>
    </>
  );
}
