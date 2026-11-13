import Link from "next/link";
import {
  formatJournalDate,
  type JournalArticle,
} from "@/lib/content/journal-static";

type JournalArticleBodyProps = {
  article: JournalArticle;
};

/**
 * Reading layout: a narrow meta rail on the left of the 12-column grid and
 * a single text column (about 36 characters wide) beside it.
 */
export function JournalArticleBody({ article }: JournalArticleBodyProps) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-0">
      <aside className="md:col-span-3">
        <dl className="grid grid-cols-2 gap-6 border-t border-[var(--color-ink)] pt-4 md:sticky md:top-[calc(var(--header-height)+var(--space-3))] md:grid-cols-1">
          <div>
            <dt className="type-caption">公開日</dt>
            <dd className="mt-1 font-en text-[15px] tracking-[0.04em] tabular-nums text-[var(--color-ink)]">
              <time dateTime={article.publishedAt}>
                {formatJournalDate(article.publishedAt)}
              </time>
            </dd>
          </div>
          {article.helperJa ? (
            <div>
              <dt className="type-caption">テーマ</dt>
              <dd className="mt-1 text-[14px] font-bold tracking-[0.06em] text-[var(--color-ink)]">
                {article.helperJa}
              </dd>
            </div>
          ) : null}
          <div className="col-span-2 hidden md:col-span-1 md:block">
            <Link
              href="/journal"
              className="type-label text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] hover:text-[var(--color-navy)]"
            >
              ← Journal
            </Link>
          </div>
        </dl>
      </aside>

      <div className="md:col-span-7 md:col-start-5">
        <div className="max-w-[40em] space-y-7">
          {article.body.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 16)}`}
              className={
                index === 0
                  ? "text-[16px] font-bold leading-[2] tracking-[0.04em] text-[var(--color-ink)] md:text-[18px]"
                  : "type-body !leading-[2.1] text-[var(--color-ink)]"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
