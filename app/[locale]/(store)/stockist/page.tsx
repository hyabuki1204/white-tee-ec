import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatJournalDate } from "@/lib/content/journal-static";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import {
  getStockistCopy,
  getStockistImages,
  getStockistJournalArticles,
  MILL_ADDRESS_JA,
  MILL_LEGAL_NAME_JA,
  STOCKIST_HERO_IMAGE,
} from "@/lib/store-ui/stockist";
import {
  buttonOnDarkClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  pageGutterClass,
  textLinkClass,
} from "@/lib/store-ui/ui-classes";

type StockistPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: StockistPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { page } = getStockistCopy(locale);

  return buildPageMetadata({
    title: page.label,
    description: page.lead,
    path: "/stockist",
    locale,
    image: STOCKIST_HERO_IMAGE,
  });
}

export default async function StockistPage({ params }: StockistPageProps) {
  const locale = await resolveLocale(params);
  const {
    page: STOCKIST_PAGE,
    store: STOCKIST_STORE,
    mill: STOCKIST_MILL,
    journal: journalCopy,
  } = getStockistCopy(locale);
  const STOCKIST_IMAGES = getStockistImages(locale);
  const journalArticles = await getStockistJournalArticles(locale);

  return (
    <>
      <PageHeader
        label={STOCKIST_PAGE.label}
        title={STOCKIST_PAGE.title.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        lead={STOCKIST_PAGE.lead}
      />

      <section
        aria-label={STOCKIST_STORE.title}
        className={`${pageGutterClass} grid gap-8 py-[var(--space-5)] md:grid-cols-12 md:gap-0 md:py-[var(--space-6)]`}
      >
        <div className="md:col-span-4">
          <p className="type-label !text-[var(--color-navy)]">
            {STOCKIST_STORE.label}
          </p>
          <h2 className="type-h2 mt-3">{STOCKIST_STORE.title}</h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <div className="max-w-[40em] space-y-3">
            {STOCKIST_STORE.lines.map((line) => (
              <p key={line} className="type-body text-[var(--color-ink)]">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className={buttonPrimaryClass}>
              {STOCKIST_STORE.viewCollection}
            </Link>
            <Link href="/fabric" className={buttonSecondaryClass}>
              {STOCKIST_STORE.chooseByGauge}
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label={STOCKIST_MILL.title}
        className="on-mill py-[var(--space-5)] md:py-[var(--space-6)]"
      >
        <div className={`${pageGutterClass} grid gap-10 md:grid-cols-12 md:items-end md:gap-0`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-mill-soft)] md:col-span-6">
            <Image
              src={STOCKIST_HERO_IMAGE}
              alt={STOCKIST_PAGE.heroAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <p className="type-label">{STOCKIST_MILL.label}</p>
            <h2 className="type-h2 mt-3">{STOCKIST_MILL.title}</h2>

            <dl className="mt-8 border-t border-[var(--color-hairline)]">
              {STOCKIST_MILL.rows.map((row) => (
                <div
                  key={row.label}
                  className={`grid ${locale === "en" ? "grid-cols-[6em_1fr]" : "grid-cols-[5em_1fr]"} gap-x-4 border-b border-[var(--color-hairline)] py-4`}
                >
                  <dt className="type-caption pt-0.5">{row.label}</dt>
                  <dd className="type-body">
                    {row.kind === "address" ? (
                      <address className="not-italic">{row.value}</address>
                    ) : (
                      row.value
                    )}
                    {/* English page: the registered name and address as
                        written in Japan, beside the English version. */}
                    {locale === "en" && row.kind === "name" ? (
                      <span lang="ja" className="type-caption block">
                        {MILL_LEGAL_NAME_JA}
                      </span>
                    ) : null}
                    {locale === "en" && row.kind === "address" ? (
                      <span lang="ja" className="type-caption block">
                        {MILL_ADDRESS_JA}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="type-caption mt-6">{STOCKIST_MILL.note}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className={buttonOnDarkClass}>
                {STOCKIST_MILL.contact}
              </Link>
              <Link href="/about" className={buttonOnDarkClass}>
                {STOCKIST_MILL.about}
              </Link>
            </div>
          </div>
        </div>

        <ul className={`${pageGutterClass} mt-[var(--space-5)] grid grid-cols-3 gap-2 md:gap-4`}>
          {STOCKIST_IMAGES.map((image) => (
            <li key={image.src}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-mill-soft)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 380px"
                  className="object-cover"
                />
              </div>
              <p className="type-caption mt-3">{image.caption}</p>
            </li>
          ))}
        </ul>
      </section>

      {journalArticles.length > 0 ? (
        <section
          aria-label="Journal"
          className={`${pageGutterClass} grid gap-8 py-[var(--space-5)] md:grid-cols-12 md:gap-0 md:py-[var(--space-6)]`}
        >
          <div className="md:col-span-4">
            <p className="type-label !text-[var(--color-navy)]">
              {journalCopy.label}
            </p>
            <h2 className="type-h2 mt-3">{journalCopy.title}</h2>
            <Link href="/journal" className={`${textLinkClass} mt-6 inline-block`}>
              {journalCopy.all}
            </Link>
          </div>
          <ul className="border-t border-[var(--color-ink)] md:col-span-7 md:col-start-6">
            {journalArticles.map((article) => (
              <li
                key={article.slug}
                className="border-b border-[var(--color-hairline)]"
              >
                <Link
                  href={`/journal/${article.slug}`}
                  className="group grid gap-1 py-5 sm:grid-cols-[7.5em_1fr] sm:gap-4"
                >
                  <time
                    dateTime={article.publishedAt}
                    className="type-label pt-1 tabular-nums"
                  >
                    {formatJournalDate(article.publishedAt)}
                  </time>
                  <span>
                    <span className="block text-[16px] font-bold leading-[1.7] tracking-[0.06em] text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] group-hover:text-[var(--color-navy)]">
                      {article.title}
                    </span>
                    <span className="type-caption mt-1 block">
                      {article.excerpt}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
