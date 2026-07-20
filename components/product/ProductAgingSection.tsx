import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import {
  getWearingNoteForFabric,
  type WearingNote,
} from "@/lib/store-ui/credibility";

type ProductAgingSectionProps = {
  fabricName?: string | null;
};

const AGING_COPY = {
  label: "AGING",
  title: "経年変化",
} as const;

function AgingBody({ note }: { note: WearingNote }) {
  return (
    <div className="mt-[var(--space-4)] max-w-xl space-y-3 md:mt-[var(--space-5)]">
      <p className="type-label text-[var(--color-ink)]">
        {note.fabric}
      </p>
      <p className="text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)]">
        {note.months}か月着用
      </p>
      <div className="space-y-1">
        {note.lines.map((line) => (
          <p
            key={line}
            className="text-[14px] font-normal leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--color-ink-soft)]"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Full-width aging note matched to the product fabric. */
export function ProductAgingSection({ fabricName }: ProductAgingSectionProps) {
  const note = getWearingNoteForFabric(fabricName);

  if (!note) return null;

  return (
    <section
      aria-label={AGING_COPY.title}
      className="border-t border-[var(--color-hairline)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <HomeSectionHeading
          label={AGING_COPY.label}
          title={AGING_COPY.title}
        />
        <AgingBody note={note} />
      </div>
    </section>
  );
}
