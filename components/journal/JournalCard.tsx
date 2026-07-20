import Image from "next/image";
import Link from "next/link";
import { formatJournalDate } from "@/lib/content/journal-static";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { cn } from "@/lib/utils";
import type { JournalArticle } from "@/lib/content/journal-static";

type JournalCardProps = {
  article: JournalArticle;
  variant?: "editorial" | "compact";
  className?: string;
};

export function JournalCard({
  article,
  variant = "editorial",
  className,
}: JournalCardProps) {
  const isEditorial = variant === "editorial";

  return (
    <article className={cn("group", className)}>
      <Link href={`/journal/${article.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-[var(--color-image-placeholder)]",
            isEditorial ? "aspect-[4/3]" : "aspect-[16/10]",
          )}
        >
          <Image
            src={article.heroImageUrl}
            alt={article.heroImageAlt}
            fill
            quality={90}
            sizes={
              isEditorial
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover brightness-[0.97] contrast-[0.98] transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)] [@media(hover:hover)]:group-hover:opacity-90"
          />
        </div>

        <div className={cn(isEditorial ? "mt-6 md:mt-8" : "mt-5 md:mt-6")}>
          <time
            dateTime={article.publishedAt}
            className="text-[11px] font-normal tracking-[0.1em] text-neutral-600"
          >
            {formatJournalDate(article.publishedAt)}
          </time>
          <h3
            className={cn(
              "mt-2 font-normal tracking-[0.06em] text-neutral-800 transition-opacity duration-[var(--duration-quiet)] [@media(hover:hover)]:group-hover:opacity-60",
              isEditorial
                ? "text-[14px] leading-snug md:text-[14px]"
                : "text-[14px] leading-snug",
            )}
          >
            {article.title}
          </h3>
          <p
            className={cn(
              "mt-3 font-normal leading-[1.85] text-neutral-600",
              isEditorial
                ? "text-[14px] tracking-[0.02em] md:text-[14px]"
                : "text-[12px] tracking-[0.02em]",
            )}
          >
            {article.excerpt}
          </p>
          {article.helperJa ? (
            <JaHelperText spacing="tight" className="!mt-3 max-w-none">
              {article.helperJa}
            </JaHelperText>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
