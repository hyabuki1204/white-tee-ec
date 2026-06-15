import Link from "next/link";
import type { AboutPageContent } from "@/types/site-content";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type AboutContentProps = Pick<
  AboutPageContent,
  "headline" | "bodyParagraphs" | "helperJa"
>;

export function AboutContent({
  headline,
  bodyParagraphs,
  helperJa,
}: AboutContentProps) {
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <div className="flex flex-col items-center text-center">
      <div aria-hidden className="h-12 sm:h-20 md:h-36 lg:h-44" />

      <h1 className="max-w-sm text-[15px] font-light tracking-[0.1em] text-neutral-800 md:text-sm md:tracking-[0.12em]">
        {headline}
      </h1>

      <div className="mt-12 flex max-w-sm flex-col gap-8 sm:mt-16 sm:gap-10 md:mt-20 md:gap-12">
        {bodyParagraphs.map((paragraph) => (
          <p
            key={paragraph[0]}
            className="text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:text-xs md:leading-[2.15] md:tracking-[0.03em] md:text-neutral-500"
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

      <Link
        href="/fabric"
        className="mt-16 text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity duration-300 hover:opacity-60 md:mt-20"
      >
        {copy.exploreFabric}
      </Link>
    </div>
  );
}
