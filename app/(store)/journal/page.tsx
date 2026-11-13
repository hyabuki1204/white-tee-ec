import type { Metadata } from "next";
import Link from "next/link";
import { JournalCard } from "@/components/journal/JournalCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { JOURNAL_PAGE_HEADLINE_JA } from "@/lib/content/journal-static";
import { getJournalArticles, getJournalPageContent } from "@/lib/content/journal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  pageGutterClass,
} from "@/lib/store-ui/ui-classes";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getJournalPageContent();

  return buildPageMetadata({
    title: content.pageTitle,
    description: content.introLines.join(" "),
    path: "/journal",
  });
}

export default async function JournalPage() {
  const [content, articles] = await Promise.all([
    getJournalPageContent(),
    getJournalArticles(),
  ]);
  const [lead, ...rest] = articles;

  return (
    <>
      <PageHeader
        label={content.pageTitle}
        title={JOURNAL_PAGE_HEADLINE_JA}
        lead={content.introLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        aside={
          <p className="type-label tabular-nums">
            {String(articles.length).padStart(2, "0")} entries
          </p>
        }
      />

      <div className={`${pageGutterClass} py-[var(--space-5)] md:py-[var(--space-6)]`}>
        {lead ? <JournalCard article={lead} variant="lead" index={0} /> : null}

        {rest.length > 0 ? (
          <ul className="mt-[var(--space-5)] grid gap-x-6 gap-y-14 border-t border-[var(--color-hairline)] pt-[var(--space-5)] sm:grid-cols-2 md:mt-[var(--space-6)] md:pt-[var(--space-6)] lg:grid-cols-3">
            {rest.map((article, index) => (
              <li key={article.slug}>
                <JournalCard
                  article={article}
                  variant="editorial"
                  index={index + 1}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <section
        aria-label="Gauge"
        className="border-t border-[var(--color-hairline)] bg-[var(--color-surface)]"
      >
        <div
          className={`${pageGutterClass} grid gap-8 py-[var(--space-5)] md:grid-cols-12 md:items-end md:gap-0 md:py-[var(--space-6)]`}
        >
          <div className="md:col-span-6">
            <p className="type-label !text-[var(--color-navy)]">Gauge</p>
            <h2 className="type-h2 mt-3">読んだら、生地を選ぶ。</h2>
            <p className="type-body mt-4 text-[var(--color-ink-soft)]">
              28、36、46。3つのゲージの違いを、数字と生地の写真で見比べられます。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-5 md:col-start-8 md:justify-end">
            <Link href="/fabric" className={buttonPrimaryClass}>
              ゲージを見る
            </Link>
            <Link href="/products" className={buttonSecondaryClass}>
              コレクション
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
