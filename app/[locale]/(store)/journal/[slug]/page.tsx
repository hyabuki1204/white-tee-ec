import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { JournalArticleBody } from "@/components/journal/JournalArticleBody";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatJournalDate } from "@/lib/content/journal-static";
import {
  getJournalArticles,
  getJournalPageContent,
  getJournalSlugs,
  getJournalSlugsForLocale,
} from "@/lib/content/journal";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { hasEnglishJournalArticle } from "@/lib/i18n/content-en";
import { defineCopy } from "@/lib/i18n/define-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buttonOnDarkClass,
  pageGutterClass,
  textLinkClass,
} from "@/lib/store-ui/ui-classes";

const getCopy = defineCopy(
  {
    viewGauge: "ゲージを見る",
    aboutMill: "工場について",
    backToList: "記事一覧へ戻る",
    nextLabel: "Next entry",
    readNext: "次の記事を読む",
  },
  {
    viewGauge: "See the gauges",
    aboutMill: "About the mill",
    backToList: "Back to all entries",
    nextLabel: "Next entry",
    readNext: "Read the next entry",
  },
);

type JournalArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  // English only has the entries with an English counterpart.
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) =>
      (await getJournalSlugsForLocale(locale)).map((slug) => ({ locale, slug })),
    ),
  );
  return perLocale.flat();
}

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    return { title: "Not Found" };
  }

  const articles = await getJournalArticles(locale);
  const article = articles.find((entry) => entry.slug === slug);

  if (!article) {
    return { title: "Not Found" };
  }

  // hreflang only lists the languages this entry really exists in.
  const storedSlugs = await getJournalSlugs();
  const availableLocales = LOCALES.filter((entry) =>
    entry === "en"
      ? hasEnglishJournalArticle(article.slug)
      : storedSlugs.includes(article.slug),
  );

  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/journal/${article.slug}`,
    locale,
    availableLocales,
    image: article.heroImageUrl,
    type: "article",
  });
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getCopy(locale);
  const [articles, content] = await Promise.all([
    getJournalArticles(locale),
    getJournalPageContent(locale),
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
        <JournalArticleBody locale={locale} article={article} />

        <div className="mt-[var(--space-5)] grid md:mt-[var(--space-6)] md:grid-cols-12">
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--color-hairline)] pt-6 md:col-span-7 md:col-start-5">
            <Link href="/fabric" className={textLinkClass}>
              {copy.viewGauge}
            </Link>
            <Link href="/about" className={textLinkClass}>
              {copy.aboutMill}
            </Link>
            <Link href="/journal" className={textLinkClass}>
              {copy.backToList}
            </Link>
          </div>
        </div>
      </div>

      {next ? (
        <section aria-label={copy.nextLabel} className="on-mill">
          <div
            className={`${pageGutterClass} grid gap-8 py-[var(--space-5)] md:grid-cols-12 md:items-center md:gap-0 md:py-[var(--space-6)]`}
          >
            <div className="md:col-span-6">
              <p className="type-label">{copy.nextLabel}</p>
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
                {copy.readNext}
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
