import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type CopySectionProps = {
  heroCopy: string;
  conceptLines: [string, string];
};

export function CopySection({ heroCopy, conceptLines }: CopySectionProps) {
  const { home: copy } = SITE_UI_COPY;

  return (
    <section
      aria-label="Brand statement"
      className="flex flex-col items-center px-6 pt-8 pb-16 sm:pt-10 sm:pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
    >
      <h1 className="hidden text-center text-[14px] font-light tracking-[0.14em] text-neutral-800 md:block">
        {heroCopy}
      </h1>

      <p className="w-full max-w-[18rem] text-center text-[13px] font-light leading-[1.95] tracking-[0.03em] text-neutral-600 sm:max-w-[16rem] md:mt-10 md:max-w-[22rem] md:text-[12px] md:leading-[2.05] md:tracking-[0.04em] md:text-neutral-500 lg:mt-12">
        {conceptLines[0]}
        <br />
        {conceptLines[1]}
      </p>

      <Link
        href="/fabric"
        className="mt-10 hidden text-[11px] font-light tracking-[0.1em] text-neutral-400 transition-opacity duration-300 hover:opacity-60 md:inline-block"
      >
        {copy.exploreFabric}
      </Link>
    </section>
  );
}
