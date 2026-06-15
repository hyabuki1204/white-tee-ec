import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type CopySectionProps = {
  heroCopy: string;
  fabricIntroLines: [string, string];
};

export function CopySection({
  heroCopy,
  fabricIntroLines,
}: CopySectionProps) {
  const { home: copy } = SITE_UI_COPY;

  return (
    <section
      aria-label="Brand statement"
      className="bg-background px-6 pt-20 pb-6 sm:pt-24 sm:pb-8 md:pt-24 md:pb-8 lg:pt-28 lg:pb-10"
    >
      <div className="mx-auto flex max-w-[16rem] flex-col items-center sm:max-w-[18rem] md:max-w-[20rem]">
        <h1 className="text-center text-[15px] font-light leading-[2] tracking-[0.12em] text-neutral-800 sm:text-[14px] md:leading-[2.1] md:tracking-[0.14em]">
          {heroCopy}
        </h1>

        <div className="mt-10 flex flex-col items-center gap-3 sm:mt-11 md:mt-12">
          <p className="text-center text-[11px] font-light leading-[1.9] tracking-[0.08em] text-neutral-500 md:text-[10px] md:leading-[2]">
            {copy.heroFabricLine}
          </p>
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.1em] text-neutral-400/60 transition-colors duration-300 hover:text-neutral-600 md:text-[10px]"
          >
            {copy.exploreFabric}
          </Link>
        </div>

        <p className="mt-14 text-center text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:text-xs md:leading-[2.1] md:tracking-[0.03em] md:text-neutral-500">
          {fabricIntroLines[0]}
          <br />
          {fabricIntroLines[1]}
        </p>
      </div>
    </section>
  );
}
