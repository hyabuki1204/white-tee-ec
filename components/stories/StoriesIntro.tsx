type StoriesIntroProps = {
  pageTitle: string;
  introLines: [string, string];
};

export function StoriesIntro({ pageTitle, introLines }: StoriesIntroProps) {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <p className="text-[13px] tracking-[0.24em] text-neutral-600 md:text-xs md:tracking-[0.3em] md:text-neutral-500">
        {pageTitle}
      </p>

      <p className="mt-8 max-w-md text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 sm:mt-10 md:mt-12 md:text-xs md:leading-[2.1] md:tracking-[0.03em]">
        {introLines.map((line, index) => (
          <span key={line}>
            {line}
            {index < introLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </header>
  );
}
