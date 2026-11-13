import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import {
  formatJournalDate,
  type JournalArticle,
} from "@/lib/content/journal-static";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type JournalCardProps = {
  locale: Locale;
  article: JournalArticle;
  /**
   * lead — the large first entry of the journal list (image beside text).
   * editorial — portrait card for the list grid.
   * compact — landscape card for two-up rows.
   */
  variant?: "lead" | "editorial" | "compact";
  /** Position in the list, shown as "01". */
  index?: number;
  className?: string;
};

function Meta({ article, index }: { article: JournalArticle; index?: number }) {
  return (
    <p className="type-label flex flex-wrap items-baseline gap-x-3 tabular-nums">
      {index != null ? (
        <span className="!text-[var(--color-navy)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
      <time dateTime={article.publishedAt}>
        {formatJournalDate(article.publishedAt)}
      </time>
      {article.helperJa ? (
        <span className="type-caption">{article.helperJa}</span>
      ) : null}
    </p>
  );
}

const imageHover =
  "object-cover transition-transform duration-[var(--duration-reveal)] ease-[var(--ease-quiet)] [@media(hover:hover)]:group-hover:scale-[1.02]";

export function JournalCard({
  locale,
  article,
  variant = "editorial",
  index,
  className,
}: JournalCardProps) {
  const href = `/journal/${article.slug}`;

  if (variant === "lead") {
    return (
      <article className={cn("group", className)}>
        <Link
          href={href}
          className="grid gap-8 md:grid-cols-12 md:items-end md:gap-0"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)] md:col-span-7 md:aspect-[3/2]">
            <Image
              src={article.heroImageUrl}
              alt={article.heroImageAlt}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 58vw"
              className={imageHover}
            />
          </div>
          <div className="md:col-span-4 md:col-start-9 md:pb-2">
            <Meta article={article} index={index} />
            <h2 className="type-display mt-5 !text-[clamp(24px,calc(16px+1.4vw),36px)]">
              {article.title}
            </h2>
            <p className="type-body mt-5 text-[var(--color-ink-soft)]">
              {article.excerpt}
            </p>
            <p className="mt-8 inline-flex items-center gap-3 text-[13px] tracking-[0.12em] text-[var(--color-navy)]">
              <span className="border-b border-[var(--color-navy)] pb-1">
                {locale === "en" ? "Read" : "読む"}
              </span>
              <span aria-hidden className="font-en">
                →
              </span>
            </p>
          </div>
        </Link>
      </article>
    );
  }

  const isCompact = variant === "compact";

  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-[var(--color-image-placeholder)]",
            isCompact ? "aspect-[3/2]" : "aspect-[4/5]",
          )}
        >
          <Image
            src={article.heroImageUrl}
            alt={article.heroImageAlt}
            fill
            sizes={
              isCompact
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className={imageHover}
          />
        </div>

        <div className="mt-5 border-t border-[var(--color-ink)] pt-4">
          <Meta article={article} index={index} />
          <h3 className="type-h2 mt-3 !text-[clamp(17px,calc(14px+0.4vw),20px)] transition-colors duration-[var(--duration-quiet)] [@media(hover:hover)]:group-hover:text-[var(--color-navy)]">
            {article.title}
          </h3>
          <p className="type-body mt-3 text-[var(--color-ink-soft)]">
            {article.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
