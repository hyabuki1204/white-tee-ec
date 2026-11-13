import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalArticleBody } from "@/components/journal/JournalArticleBody";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatJournalDate } from "@/lib/content/journal-static";
import {
  getJournalArticles,
  getJournalPageContent,
  getJournalSlugs,
} from "@/lib/content/journal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buttonOnDarkClass,
  pageGutterClass,
  textLinkClass,
} from "@/lib/store-ui/ui-classes";

type JournalArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getJournalSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getJournalArticles();
  const article = articles.find((entry) => entry.slug === slug);

  if (!article) {
    return { title: "Not Found" };
  }

  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/journal/${article.slug}`,
    image: article.heroImageUrl,
    type: "article",
  });
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const [articles, content] = await Promise.all([
    getJournalArticles(),
    getJournalPageContent(),
  ]);
  const index = articles.findIndex((entry) => entry.slug === slug);

  if (index === -1) {
    notFound();
  }

  const article = articles[index];
  // Newest first, so "next" walks back in time and wraps to the newest.
  const next =
    articles.length > 1 ? articles[(index + 1) % articles.length] : null;

  return (
    <article>
      <PageHeader
        label={
          <>
            <Link href="/journal" className="hover:underline">
              {content.pageTitle}
            </Link>
            <span className="mx-2 text-[var(--color-ink-faint)]">/</span>
            <time dateTime={article.publishedAt} className="tabular-nums">
              {formatJournalDate(article.publishedAt)}
            </time>
          </>
        }
        title={article.title}
        lead={article.excerpt}
      />

      <div className={`${pageGutterClass} pt-[var(--space-4)] md:pt-[var(--space-5)]`}>
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)] md:aspect-[21/9]">
            <Image
              src={article.heroImageUrl}
              alt={article.heroImageAlt}
              fill
              preload
              sizes="(max-width: 1280px) 100vw, 1184px"
              className="object-cover"
            />
          </div>
          <figcaption className="type-caption mt-3">
            {article.heroImageAlt}
          </figcaption>
        </figure>
      </div>

      <div className={`${pageGutterClass} py-[var(--space-5)] md:py-[var(--space-6)]`}>
        <JournalArticleBody article={article} />

        <div className="mt-[var(--space-5)] grid md:mt-[var(--space-6)] md:grid-cols-12">
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--color-hairline)] pt-6 md:col-span-7 md:col-start-5">
            <Link href="/fabric" className={textLinkClass}>
              ゲージを見る
            </Link>
            <Link href="/about" className={textLinkClass}>
              工場について
            </Link>
            <Link href="/journal" className={textLinkClass}>
              記事一覧へ戻る
            </Link>
          </div>
        </div>
      </div>

      {next ? (
        <section aria-label="Next entry" className="on-mill">
          <div
            className={`${pageGutterClass} grid gap-8 py-[var(--space-5)] md:grid-cols-12 md:items-center md:gap-0 md:py-[var(--space-6)]`}
          >
            <div className="md:col-span-6">
              <p className="type-label">Next entry</p>
              <p className="type-label mt-6 tabular-nums">
                <time dateTime={next.publishedAt}>
                  {formatJournalDate(next.publishedAt)}
                </time>
              </p>
              <h2 className="type-display mt-3 !text-[clamp(24px,calc(16px+1.4vw),36px)]">
                {next.title}
              </h2>
              <p className="type-body mt-4 max-w-[34em] text-[var(--color-ink-soft)]">
                {next.excerpt}
              </p>
              <Link
                href={`/journal/${next.slug}`}
                className={`${buttonOnDarkClass} mt-8`}
              >
                次の記事を読む
              </Link>
            </div>
            <Link
              href={`/journal/${next.slug}`}
              aria-hidden
              tabIndex={-1}
              className="relative block aspect-[3/2] overflow-hidden bg-[var(--color-mill-soft)] md:col-span-5 md:col-start-8"
            >
              <Image
                src={next.heroImageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
