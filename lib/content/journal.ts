import "server-only";

import { getSiteContent } from "@/lib/content/queries";
import type { JournalArticleContent } from "@/types/site-content";
import type { JournalArticle } from "@/lib/content/journal-static";

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

export async function getJournalPageContent() {
  return getSiteContent("journal");
}

/** All entries, newest first. */
export async function getJournalArticles(): Promise<JournalArticle[]> {
  const content = await getJournalPageContent();
  return sortArticlesByDate(content.articles.map(toJournalArticle));
}

export async function getJournalArticleBySlug(
  slug: string,
): Promise<JournalArticle | undefined> {
  const articles = await getJournalArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getFeaturedJournalArticles(
  limit = 3,
): Promise<JournalArticle[]> {
  const articles = await getJournalArticles();
  const featured = articles.filter((article) => article.featured);
  const pool = featured.length >= limit ? featured : articles;
  return sortArticlesByDate(pool).slice(0, limit);
}

export async function getJournalSlugs(): Promise<string[]> {
  const articles = await getJournalArticles();
  return articles.map((article) => article.slug);
}

export async function getJournalNavArticles(): Promise<
  Array<{ slug: string; title: string }>
> {
  const articles = await getJournalArticles();
  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
  }));
}

export type { JournalArticle } from "@/lib/content/journal-static";
