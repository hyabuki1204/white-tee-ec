import type { AboutPageContent } from "@/types/site-content";

type AboutContentProps = Pick<AboutPageContent, "headline" | "bodyParagraphs">;

export function AboutContent({ headline, bodyParagraphs }: AboutContentProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div aria-hidden className="h-28 md:h-36 lg:h-44" />

      <h1 className="max-w-sm text-sm font-light tracking-[0.12em] text-neutral-800">
        {headline}
      </h1>

      <div className="mt-16 flex max-w-sm flex-col gap-10 md:mt-20 md:gap-12">
        {bodyParagraphs.map((paragraph) => (
          <p
            key={paragraph[0]}
            className="text-xs font-light leading-[2.15] tracking-[0.03em] text-neutral-500"
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
    </div>
  );
}
