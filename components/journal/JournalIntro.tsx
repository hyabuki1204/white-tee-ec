import { JOURNAL_INTRO_LINES, JOURNAL_PAGE_TITLE } from "@/lib/content/journal";

export function JournalIntro() {
  return (
    <header className="mx-auto max-w-2xl text-center">
      <h1 className="text-[13px] font-light tracking-[0.28em] text-neutral-800 md:text-[14px]">
        {JOURNAL_PAGE_TITLE}
      </h1>
      <p className="mt-6 text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:mt-8 md:text-[12px] md:leading-[2.1] md:tracking-[0.03em] md:text-neutral-500">
        {JOURNAL_INTRO_LINES.map((line, index) => (
          <span key={line}>
            {line}
            {index < JOURNAL_INTRO_LINES.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </header>
  );
}
