import { HOME_FIT_GUIDE } from "@/lib/store-ui/fit-guide";

export function HomeFitGuide() {
  return (
    <section aria-label="Fit guide" className="border-t border-[var(--color-hairline)]">
      <div className="mx-auto w-full max-w-7xl px-8 py-12 md:px-16 md:py-16">
        <p className="text-[12px] font-normal tracking-[0.2em] text-[var(--color-ink-soft)]">
          {HOME_FIT_GUIDE.title}
        </p>
        <p className="mt-4 max-w-xl text-[12px] font-normal leading-[1.95] tracking-[0.04em] text-[var(--color-ink-soft)] md:text-[14px]">
          {HOME_FIT_GUIDE.intro}
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_FIT_GUIDE.rows.map((row) => (
            <li
              key={row.label}
              className="border-t border-[var(--color-hairline)] pt-4"
            >
              <p className="text-[12px] font-normal tracking-[0.12em] text-[var(--color-ink-soft)]">
                {row.label}
              </p>
              <p className="mt-2 text-[12px] font-normal leading-[1.85] tracking-[0.04em] text-[var(--color-ink-soft)]">
                {row.line}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[11px] font-normal leading-[1.85] tracking-[0.04em] text-[var(--color-ink-soft)]">
          {HOME_FIT_GUIDE.note}
        </p>
      </div>
    </section>
  );
}
