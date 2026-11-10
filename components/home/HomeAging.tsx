import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { WEARING_NOTES } from "@/lib/store-ui/credibility";
import { STORE_TYPO } from "@/lib/store-ui/typography";

const AGING_COPY = {
  label: "AGING",
  title: "洗濯を重ねて。",
} as const;

export function HomeAging() {
  return (
    <section
      aria-label="Aging"
      className="py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <HomeSectionHeading
          label={AGING_COPY.label}
          title={AGING_COPY.title}
        />

        <ul className="mt-[var(--space-4)] grid gap-10 md:mt-[var(--space-5)] md:grid-cols-3 md:gap-8">
          {WEARING_NOTES.map((note) => (
            <li
              key={note.fabric}
              className="space-y-3 border-t border-[var(--color-hairline)] pt-[var(--space-3)]"
            >
              <p className="type-label text-[var(--color-ink)]">
                {note.fabric}
              </p>
              <p className={STORE_TYPO.caption}>
                <span className="font-en tabular-nums">{note.months}</span>か月着用
              </p>
              <div className="space-y-1">
                {note.lines.slice(0, 2).map((line) => (
                  <p key={line} className={STORE_TYPO.body}>
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
