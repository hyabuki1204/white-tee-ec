import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { WEARING_NOTES } from "@/lib/store-ui/credibility";

const AGING_COPY = {
  label: "AGING",
  title: "洗濯を重ねて。",
} as const;

export function HomeAging() {
  return (
    <section
      aria-label="Aging"
      className="border-t border-[var(--color-hairline)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <HomeSectionHeading
          label={AGING_COPY.label}
          title={AGING_COPY.title}
        />

        <ul className="mt-[var(--space-4)] grid gap-10 md:mt-[var(--space-5)] md:grid-cols-3 md:gap-8">
          {WEARING_NOTES.map((note) => (
            <li key={note.fabric} className="space-y-3">
              <p className="type-label text-[var(--color-ink)]">
                {note.fabric}
              </p>
              <p className="text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)]">
                {note.months}か月着用
              </p>
              <div className="space-y-1">
                {note.lines.slice(0, 2).map((line) => (
                  <p
                    key={line}
                    className="text-[14px] font-normal leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--color-ink-soft)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
