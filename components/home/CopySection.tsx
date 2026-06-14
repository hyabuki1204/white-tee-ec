type CopySectionProps = {
  heroCopy: string;
  conceptLines: [string, string];
};

export function CopySection({ heroCopy, conceptLines }: CopySectionProps) {
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
    </section>
  );
}
