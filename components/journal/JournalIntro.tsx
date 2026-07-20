import { JOURNAL_INTRO_LINES_JA } from "@/lib/content/journal-static";

type JournalIntroProps = {
  pageTitle: string;
  introLines: readonly string[];
};

export function JournalIntro({ pageTitle, introLines }: JournalIntroProps) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      <h1 className="text-[14px] font-normal tracking-[0.28em] text-neutral-800 md:text-[14px]">
        {pageTitle}
      </h1>
      <p className="mt-6 text-[14px] font-normal leading-[1.95] tracking-[0.02em] text-neutral-600 md:mt-8 md:text-[14px] md:leading-[2.1] md:tracking-[0.03em] md:text-neutral-600">
        {introLines.map((line, index) => (
          <span key={line}>
            {line}
            {index < introLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
      <p
        lang="ja"
        className="mx-auto mt-5 max-w-sm whitespace-pre-line font-normal text-[12px] leading-[2.05] tracking-[0.03em] text-neutral-600 sm:mt-6 md:text-[12px] md:leading-[2.15] md:text-neutral-600/90"
      >
        {JOURNAL_INTRO_LINES_JA.join("\n")}
      </p>
    </header>
  );
}
