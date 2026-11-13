import type { ReactNode } from "react";
import { InfoRows } from "@/components/layout/InfoRows";
import { LEGAL_NOTICE_EN, LEGAL_SUMMARY_EN } from "@/lib/store-ui/info-pages";

type EnglishLegalNoticeProps = {
  page: keyof typeof LEGAL_SUMMARY_EN;
  /** The Japanese original, exactly as the Japanese page renders it. */
  children: ReactNode;
};

/**
 * English view of a legal page. The legal text is not translated as if it
 * were authoritative: the page states that the Japanese governs, gives a
 * short, clearly labelled plain-English summary of what the page covers,
 * and then shows the Japanese original, marked up as Japanese.
 */
export function EnglishLegalNotice({ page, children }: EnglishLegalNoticeProps) {
  const summary = LEGAL_SUMMARY_EN[page];

  return (
    <>
      <p className="type-body max-w-[46em] border-l-2 border-[var(--color-navy)] pl-5 text-[var(--color-ink)]">
        {LEGAL_NOTICE_EN.notice}
      </p>

      <section aria-labelledby="legal-summary" className="mt-[var(--space-5)]">
        <p className="type-label !text-[var(--color-navy)]">
          {LEGAL_NOTICE_EN.summaryLabel}
        </p>
        <h2 id="legal-summary" className="type-h2 mt-3">
          {LEGAL_NOTICE_EN.summaryTitle}
        </h2>
        <p className="type-body mt-4 max-w-[46em] text-[var(--color-ink-soft)]">
          {summary.lead}
        </p>
        <InfoRows className="mt-[var(--space-4)]" as="h3" rows={summary.rows} />
      </section>

      <section
        aria-labelledby="legal-original"
        className="mt-[var(--space-6)]"
      >
        <p className="type-label !text-[var(--color-navy)]">
          {LEGAL_NOTICE_EN.originalLabel}
        </p>
        <h2 id="legal-original" className="type-h2 mt-3">
          {LEGAL_NOTICE_EN.originalTitle}
        </h2>
        <div lang="ja" data-legal-original className="mt-[var(--space-4)]">
          {children}
        </div>
      </section>
    </>
  );
}
