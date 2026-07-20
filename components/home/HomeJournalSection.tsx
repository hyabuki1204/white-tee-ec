import Link from "next/link";
import { JournalCard } from "@/components/journal/JournalCard";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { JournalArticle } from "@/lib/content/journal-static";

type HomeJournalSectionProps = {
  articles: JournalArticle[];
};

export function HomeJournalSection({ articles }: HomeJournalSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Journal"
      className="border-t border-[var(--color-hairline)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <HomeSectionHeading
            label="JOURNAL"
            title="アトリエからの記録。"
          />
          <Link
            href="/journal"
            className="type-label text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.home.viewAllJournal}
          </Link>
        </div>

        <ul className="mt-[var(--space-4)] grid grid-cols-1 gap-x-8 gap-y-12 md:mt-[var(--space-5)] md:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <JournalCard article={article} variant="compact" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
