import { KanemasaLine } from "@/components/brand/KanemasaLine";
import {
  FABRIC_INTRO_LINES,
  FABRIC_PAGE_TITLE,
} from "@/lib/fabric/content";

export function FabricIntro() {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <p className="text-[12px] font-normal tracking-[0.24em] text-neutral-600 md:text-[12px] md:tracking-[0.3em]">
        {FABRIC_PAGE_TITLE}
      </p>

      <p className="mt-8 max-w-md text-[14px] font-normal leading-[1.95] tracking-[0.02em] text-neutral-600 sm:mt-10 md:mt-12 md:text-[14px] md:leading-[2.1] md:tracking-[0.03em]">
        {FABRIC_INTRO_LINES.map((line, index) => (
          <span key={line}>
            {line}
            {index < FABRIC_INTRO_LINES.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>

      <KanemasaLine variant="factory" className="mt-10 sm:mt-12 md:mt-14" />
    </header>
  );
}
