import Link from "next/link";
import { JournalCard } from "@/components/journal/JournalCard";
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
    <section aria-label="Journal" className="border-t border-neutral-200/70 pb-16 md:pb-24">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <header className="flex items-end justify-between border-b border-neutral-200/70 py-8 md:py-10">
          <div>
            <h2 className="text-[14px] font-light tracking-[0.28em] text-neutral-800">
              {GRAPHPAPER_STORE_COPY.home.sectionJournal}
            </h2>
            <p className="mt-3 text-[12px] font-light tracking-[0.08em] text-neutral-600">
              {GRAPHPAPER_STORE_COPY.home.journalIntro}
            </p>
          </div>
          <Link
            href="/journal"
            className="hidden text-[12px] font-light tracking-[0.08em] text-neutral-600 transition-opacity hover:opacity-60 sm:inline-block"
          >
            {GRAPHPAPER_STORE_COPY.home.viewAllJournal}
          </Link>
        </header>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 pt-8 md:grid-cols-2 md:gap-y-16 md:pt-10 lg:grid-cols-3 lg:gap-x-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <JournalCard article={article} variant="compact" />
            </li>
          ))}
        </ul>

        <div className="mt-10 sm:hidden">
          <Link
            href="/journal"
            className="text-[12px] font-light tracking-[0.08em] text-neutral-600 transition-opacity hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.home.viewAllJournal}
          </Link>
        </div>
      </div>
    </section>
  );
}
