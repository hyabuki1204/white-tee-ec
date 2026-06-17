import { JournalCard } from "@/components/journal/JournalCard";
import type { JournalArticle } from "@/lib/content/journal";

type JournalGridProps = {
  articles: JournalArticle[];
};

export function JournalGrid({ articles }: JournalGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-20 lg:gap-x-12 lg:gap-y-24">
      {articles.map((article) => (
        <li key={article.slug}>
          <JournalCard article={article} variant="editorial" />
        </li>
      ))}
    </ul>
  );
}
