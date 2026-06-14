import {
  FABRIC_INTRO_LINES,
  FABRIC_PAGE_TITLE,
} from "@/lib/fabric/content";

export function FabricIntro() {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <p className="text-xs tracking-[0.3em] text-neutral-500">
        {FABRIC_PAGE_TITLE}
      </p>

      <p className="mt-10 max-w-md text-xs font-light leading-[2.1] tracking-[0.03em] text-neutral-600 md:mt-12">
        {FABRIC_INTRO_LINES.map((line, index) => (
          <span key={line}>
            {line}
            {index < FABRIC_INTRO_LINES.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </header>
  );
}
