import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { formatJournalDate } from "@/lib/content/journal-static";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getStockistJournalArticles,
  STOCKIST_CONTACT,
  STOCKIST_IMAGES,
  STOCKIST_PAGE,
  STOCKIST_STORY,
} from "@/lib/store-ui/stockist";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: STOCKIST_PAGE.title,
    description: STOCKIST_PAGE.intro[0],
    path: "/stockist",
    image: STOCKIST_PAGE.heroImage.src,
  });
}

export default async function StockistPage() {
  const journalArticles = await getStockistJournalArticles();

  return (
    <>
      <section className="relative aspect-[16/10] overflow-hidden bg-[var(--color-image-placeholder)] sm:aspect-[21/9]">
        <Image
          src={STOCKIST_PAGE.heroImage.src}
          alt={STOCKIST_PAGE.heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.97] contrast-[0.98]"
        />
      </section>

      <Container as="section" className="py-[var(--space-6)] md:py-[var(--space-7)]">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="type-label text-[var(--color-ink)]">
            {STOCKIST_PAGE.title}
          </h1>
          {STOCKIST_PAGE.intro.map((line) => (
            <p
              key={line}
              className="text-[14px] font-normal leading-[1.95] tracking-[0.02em] text-neutral-600 md:text-[14px] md:leading-[2.1] md:tracking-[0.03em] md:text-neutral-600"
            >
              {line}
            </p>
          ))}
          <p className="mt-6 text-[12px] font-normal tracking-[0.06em] text-neutral-600">
            {STOCKIST_PAGE.helperJa}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl md:mt-24">
          <h2 className="type-label text-neutral-600">
            {STOCKIST_STORY.title}
          </h2>
          <div className="mt-6 space-y-6">
            {STOCKIST_STORY.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-[14px] font-normal leading-[2] tracking-[0.03em] text-neutral-600"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl space-y-12 md:mt-24 md:space-y-16">
          {STOCKIST_IMAGES.map((image) => (
            <figure key={image.src} className="space-y-4">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-image-placeholder)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover brightness-[0.97] contrast-[0.98]"
                />
              </div>
              {image.caption ? (
                <figcaption className="text-center text-[11px] font-normal tracking-[0.12em] text-neutral-600">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl border-t border-neutral-200/60 pt-16 md:mt-24 md:pt-20">
          <h2 className="type-label text-neutral-600">
            {STOCKIST_CONTACT.title}
          </h2>

          <div className="mt-8 space-y-6 text-[14px] font-normal leading-[2] tracking-[0.03em] text-neutral-600">
            <p className="text-neutral-700">{STOCKIST_CONTACT.name}</p>
            <address className="not-italic">
              {STOCKIST_CONTACT.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="text-[12px] tracking-[0.06em] text-neutral-600">
              {STOCKIST_CONTACT.helperJa}
            </p>
            <p>{STOCKIST_CONTACT.hours}</p>
            <p>
              <a
                href={`mailto:${STOCKIST_CONTACT.email}`}
                className="transition-opacity hover:opacity-60"
              >
                {STOCKIST_CONTACT.email}
              </a>
            </p>
            <p>
              <a
                href={`tel:${STOCKIST_CONTACT.phone.replace(/[^\d+]/g, "")}`}
                className="transition-opacity hover:opacity-60"
              >
                {STOCKIST_CONTACT.phone}
              </a>
            </p>
          </div>

          <div
            aria-label="Map placeholder"
            className="mt-10 flex aspect-[16/9] items-center justify-center border border-neutral-200/70 bg-neutral-50/80"
          >
            <p className="max-w-xs px-6 text-center text-[12px] font-normal leading-[1.9] tracking-[0.04em] text-neutral-600">
              {STOCKIST_CONTACT.mapNote}
            </p>
          </div>
        </div>

        {journalArticles.length > 0 ? (
          <div className="mx-auto mt-16 max-w-2xl border-t border-neutral-200/60 pt-16 md:mt-24 md:pt-20">
            <h2 className="type-label text-neutral-600">
              From the journal
            </h2>
            <ul className="mt-8 space-y-8">
              {journalArticles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="group block transition-opacity hover:opacity-60"
                  >
                    <p className="text-[11px] font-normal tracking-[0.1em] text-neutral-600">
                      {formatJournalDate(article.publishedAt)}
                    </p>
                    <p className="mt-2 text-[14px] font-normal tracking-[0.04em] text-neutral-700">
                      {article.title}
                    </p>
                    <p className="mt-2 text-[12px] font-normal leading-[1.8] tracking-[0.03em] text-neutral-600">
                      {article.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-12 text-center">
              <Link
                href="/journal"
                className="text-[12px] font-normal tracking-[0.08em] text-neutral-600 transition-opacity hover:opacity-60"
              >
                All journal entries
              </Link>
            </div>
          </div>
        ) : null}
      </Container>
    </>
  );
}
