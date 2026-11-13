import type { Metadata } from "next";
import { Link } from "@/components/i18n/Link";
import { JournalCard } from "@/components/journal/JournalCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getJournalArticles, getJournalPageContent } from "@/lib/content/journal";
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  pageGutterClass,
} from "@/lib/store-ui/ui-classes";

const getCopy = defineCopy(
  {
    entries: (count: number) =>
      `${String(count).padStart(2, "0")} entries`,
    gaugeLabel: "Gauge",
    gaugeTitle: "読んだら、生地を選ぶ。",
    gaugeLead:
      "28、36、46。3つのゲージの違いを、数字と生地の写真で見比べられます。",
    viewGauge: "ゲージを見る",
    collection: "コレクション",
  },
  {
    entries: (count: number) =>
      `${String(count).padStart(2, "0")} ${count === 1 ? "entry" : "entries"}`,
    gaugeLabel: "Gauge",
    gaugeTitle: "Read, then choose the cloth.",
    gaugeLead:
      "28, 36, 46. Compare the three gauges by the numbers and by photographs of the cloth.",
    viewGauge: "See the gauges",
    collection: "Collection",
  },
);

type JournalPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: JournalPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = await getJournalPageContent(locale);

  return buildPageMetadata({
    title: content.pageTitle,
    description: content.introLines.join(" "),
    path: "/journal",
    locale,
  });
}

export default async function JournalPage({ params }: JournalPageProps) {
  const locale = await resolveLocale(params);
  const copy = getCopy(locale);
  const [content, articles] = await Promise.all([
    getJournalPageContent(locale),
    getJournalArticles(locale),
  ]);
  const [lead, ...rest] = articles;

  return (
    <>
      <PageHeader
        label={content.pageTitle}
        title={content.headline}
        lead={content.introLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        aside={
          <p className="type-label tabular-nums">
            {copy.entries(articles.length)}
          </p>
        }
      />

      <div className={`${pageGutterClass} py-[var(--space-5)] md:py-[var(--space-6)]`}>
        {lead ? (
          <JournalCard locale={locale} article={lead} variant="lead" index={0} />
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-[var(--space-5)] grid gap-x-6 gap-y-14 border-t border-[var(--color-hairline)] pt-[var(--space-5)] sm:grid-cols-2 md:mt-[var(--space-6)] md:pt-[var(--space-6)] lg:grid-cols-3">
            {rest.map((article, index) => (
              <li key={article.slug}>
                <JournalCard
                  locale={locale}
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
            <p className="type-label !text-[var(--color-navy)]">
              {copy.gaugeLabel}
            </p>
            <h2 className="type-h2 mt-3">{copy.gaugeTitle}</h2>
            <p className="type-body mt-4 text-[var(--color-ink-soft)]">
              {copy.gaugeLead}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-5 md:col-start-8 md:justify-end">
            <Link href="/fabric" className={buttonPrimaryClass}>
              {copy.viewGauge}
            </Link>
            <Link href="/products" className={buttonSecondaryClass}>
              {copy.collection}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
