import { JaHelperText } from "@/components/ui/JaHelperText";
import {
  formatJournalDate,
  type JournalArticle,
} from "@/lib/content/journal";

type JournalArticleBodyProps = {
  article: JournalArticle;
};

export function JournalArticleBody({ article }: JournalArticleBodyProps) {
  return (
    <article>
      <header className="mx-auto max-w-2xl text-center">
        <time
          dateTime={article.publishedAt}
          className="text-[10px] font-light tracking-[0.12em] text-neutral-400"
        >
          {formatJournalDate(article.publishedAt)}
        </time>
        <h1 className="mt-5 text-[15px] font-light tracking-[0.1em] text-neutral-800 md:text-[16px] md:tracking-[0.12em]">
          {article.title}
        </h1>
        <JaHelperText spacing="default" className="mx-auto">
          {article.titleJa}
        </JaHelperText>
        <p className="mt-6 text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 md:text-[12px] md:leading-[2.1]">
          {article.excerpt}
        </p>
        <JaHelperText spacing="default" className="mx-auto">
          {article.excerptJa}
        </JaHelperText>
      </header>

      <div className="mx-auto mt-12 max-w-xl md:mt-16">
        {article.body.map((paragraph, index) => {
          const paragraphJa = article.bodyJa[index];

          return (
            <div key={paragraph.slice(0, 32)} className="[&+&]:mt-8">
              <p className="text-[13px] font-light leading-[2] tracking-[0.02em] text-neutral-600 md:text-[12px] md:leading-[2.15]">
                {paragraph}
              </p>
              {paragraphJa ? (
                <p
                  lang="ja"
                  className="mt-4 text-[12px] font-extralight leading-[2.05] tracking-[0.03em] text-neutral-500 md:text-[11px] md:leading-[2.15]"
                >
                  {paragraphJa}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
