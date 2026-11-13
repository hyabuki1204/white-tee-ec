import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  getWearingNoteForFabric,
  type WearingNote,
} from "@/lib/store-ui/credibility";

type ProductAgingSectionProps = {
  locale: Locale;
  fabricName?: string | null;
};

const getAgingCopy = defineCopy(
  { label: "AGING", title: "経年変化" },
  { label: "AGEING", title: "How it wears in" },
);

function AgingBody({ note }: { note: WearingNote }) {
  return (
    <div className="mt-[var(--space-4)] max-w-xl space-y-3 md:mt-[var(--space-5)]">
      <p className="type-label text-[var(--color-ink)]">
        {note.fabric}
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
export function ProductAgingSection({
  locale,
  fabricName,
}: ProductAgingSectionProps) {
  const AGING_COPY = getAgingCopy(locale);
  const note = getWearingNoteForFabric(fabricName, locale);

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
