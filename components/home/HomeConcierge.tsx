import { Concierge } from "@/components/concierge/Concierge";
import { getConciergeCopy } from "@/lib/concierge/ui-copy";
import type { Locale } from "@/lib/i18n/config";

/** Home section: the concierge, placed directly after the gauge ladder. */
export function HomeConcierge({ locale }: { locale: Locale }) {
  const copy = getConciergeCopy(locale);

  return (
    <section
      id="concierge"
      aria-labelledby="home-concierge-title"
      className="scroll-mt-[var(--header-height)] bg-[var(--color-ground)] pb-[var(--space-5)] md:pb-[var(--space-6)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="border-t border-[var(--color-hairline)] pt-[var(--space-5)] md:grid md:grid-cols-12 md:pt-[var(--space-6)]">
          <header className="md:col-span-4">
            <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
            <h2 id="home-concierge-title" className="type-h2 mt-3">
              {copy.title}
            </h2>
            <p className="type-body mt-4 max-w-[30em] text-[var(--color-ink-soft)]">
              {copy.lead}
            </p>
          </header>

          <div className="mt-[var(--space-4)] md:col-span-7 md:col-start-6 md:mt-0">
            <Concierge />
          </div>
        </div>
      </div>
    </section>
  );
}
