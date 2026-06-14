type StoriesIntroProps = {
  pageTitle: string;
  introLines: [string, string];
};

export function StoriesIntro({ pageTitle, introLines }: StoriesIntroProps) {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <p className="text-xs tracking-[0.3em] text-neutral-500">{pageTitle}</p>

      <p className="mt-10 max-w-md text-xs font-light leading-[2.1] tracking-[0.03em] text-neutral-600 md:mt-12">
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
