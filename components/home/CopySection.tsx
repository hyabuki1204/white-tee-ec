type CopySectionProps = {
  heroCopy: string;
  conceptLines: [string, string];
};

export function CopySection({ heroCopy, conceptLines }: CopySectionProps) {
  return (
    <section
      aria-label="Brand statement"
      className="flex flex-col items-center px-6 pt-28 pb-32 md:pt-32 md:pb-36 lg:pt-36 lg:pb-40"
    >
      <div className="flex w-full flex-col items-center gap-20 md:gap-24 lg:gap-28">
        <h2 className="text-center text-[15px] font-light leading-[1.7] tracking-[0.14em] text-neutral-800 md:text-[14px]">
          {heroCopy}
        </h2>

        <p className="w-full max-w-[16rem] text-center text-[12px] font-light leading-[1.85] tracking-[0.04em] text-neutral-500 md:max-w-[15rem] md:text-[11px]">
          {conceptLines[0]}
          <br />
          {conceptLines[1]}
        </p>
      </div>
    </section>
  );
}
