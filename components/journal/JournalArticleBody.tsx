import { JaHelperText } from "@/components/ui/JaHelperText";
import {
  formatJournalDate,
  type JournalArticle,
} from "@/lib/content/journal-static";

type JournalArticleBodyProps = {
  article: JournalArticle;
};

export function JournalArticleBody({ article }: JournalArticleBodyProps) {
  return (
    <article>
      <header className="mx-auto max-w-2xl text-center">
        <time
          dateTime={article.publishedAt}
          className="text-[11px] font-light tracking-[0.12em] text-neutral-600"
        >
          {formatJournalDate(article.publishedAt)}
        </time>
        <h1 className="mt-5 text-[16px] font-light tracking-[0.1em] text-neutral-800 md:text-[16px] md:tracking-[0.12em]">
          {article.title}
        </h1>
        <p className="mt-6 text-[14px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:text-[14px] md:leading-[2.1]">
          {article.excerpt}
        </p>
        {article.helperJa ? (
          <JaHelperText spacing="default" className="mx-auto">
            {article.helperJa}
          </JaHelperText>
        ) : null}
      </header>

      <div className="mx-auto mt-12 max-w-xl md:mt-16">
        {article.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="text-[14px] font-light leading-[2] tracking-[0.02em] text-neutral-600 md:text-[14px] md:leading-[2.15] [&+&]:mt-8"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
