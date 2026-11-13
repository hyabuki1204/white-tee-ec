import "server-only";

import { getSiteContent } from "@/lib/content/queries";
import type { JournalArticleContent } from "@/types/site-content";
import type { JournalArticle } from "@/lib/content/journal-static";
import { JOURNAL_PAGE_HEADLINE_JA } from "@/lib/content/journal-static";
import type { Locale } from "@/lib/i18n/config";
import {
  JOURNAL_PAGE_EN,
  localizeJournalArticles,
} from "@/lib/i18n/content-en";

/**
 * Entries saved before the mill photographs replaced the generated pictures
 * may still carry the old image paths. Point them at the real photographs.
 */
const LEGACY_HERO_IMAGES: Record<string, string> = {
  "/journal/journal-knitting-machine.jpg": "/mill/needle.jpg",
  "/journal/journal-jersey-texture.jpg": "/mill/ring.jpg",
  "/journal/journal-atelier.jpg": "/mill/fabric.jpg",
  "/journal/journal-raw-cotton.jpg": "/mill/yarn.jpg",
};

function toJournalArticle(article: JournalArticleContent): JournalArticle {
  return {
    slug: article.slug,
    title: article.title,
    publishedAt: article.publishedAt,
    excerpt: article.excerpt,
    helperJa: article.helperJa ?? undefined,
    heroImageUrl: LEGACY_HERO_IMAGES[article.heroImage] ?? article.heroImage,
    heroImageAlt: article.heroImageAlt,
    featured: article.featured,
    body: article.body,
  };
}

function sortArticlesByDate(articles: JournalArticle[]): JournalArticle[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export type JournalPageCopy = {
  pageTitle: string;
  headline: string;
  introLines: [string, string];
};

/** Page title, headline and intro. English is static; Japanese is editable. */
export async function getJournalPageContent(
  locale: Locale,
): Promise<JournalPageCopy> {
  if (locale === "en") {
    return JOURNAL_PAGE_EN;
  }

  const content = await getSiteContent("journal");

  return {
    pageTitle: content.pageTitle,
    headline: JOURNAL_PAGE_HEADLINE_JA,
    introLines: content.introLines,
  };
}

async function getStoredJournalArticles(): Promise<JournalArticle[]> {
  const content = await getSiteContent("journal");
  return sortArticlesByDate(content.articles.map(toJournalArticle));
}

/**
 * All entries, newest first. In English, entries without an English
 * counterpart are left out.
 */
export async function getJournalArticles(
  locale: Locale,
): Promise<JournalArticle[]> {
  return localizeJournalArticles(await getStoredJournalArticles(), locale);
}

export async function getJournalArticleBySlug(
  slug: string,
  locale: Locale,
): Promise<JournalArticle | undefined> {
  const articles = await getJournalArticles(locale);
  return articles.find((article) => article.slug === slug);
}

export async function getFeaturedJournalArticles(
  locale: Locale,
  limit = 3,
): Promise<JournalArticle[]> {
  const articles = await getJournalArticles(locale);
  const featured = articles.filter((article) => article.featured);
  const pool = featured.length >= limit ? featured : articles;
  return sortArticlesByDate(pool).slice(0, limit);
}

/** Slugs of every stored entry (Japanese has all of them). */
export async function getJournalSlugs(): Promise<string[]> {
  const articles = await getStoredJournalArticles();
  return articles.map((article) => article.slug);
}

/** Slugs available in a locale. */
export async function getJournalSlugsForLocale(
  locale: Locale,
): Promise<string[]> {
  const articles = await getJournalArticles(locale);
  return articles.map((article) => article.slug);
}

export type { JournalArticle } from "@/lib/content/journal-static";
