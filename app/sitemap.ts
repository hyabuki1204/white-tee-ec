import type { MetadataRoute } from "next";
import { getFabricSlugs } from "@/lib/fabric/queries";
import { getJournalSlugs } from "@/lib/content/journal";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { hasEnglishJournalArticle } from "@/lib/i18n/content-en";
import { getAllProductSlugs } from "@/lib/products/queries";
import { languageAlternates, localizedUrl } from "@/lib/seo/metadata";

/**
 * The catalog lives in the database and changes without a deploy (admin
 * edits, and migrations that run after the build). Re-read it periodically
 * instead of freezing whatever the database held at build time.
 */
export const revalidate = 300;

const STATIC_PATHS = [
  "/",
  "/fabric",
  "/products",
  "/about",
  "/concierge",
  "/journal",
  "/contact",
  "/store-guide",
  "/stockist",
  "/shipping",
  "/privacy",
  "/terms",
  "/legal",
] as const;

type Entry = MetadataRoute.Sitemap[number];

/**
 * One sitemap entry per locale a page exists in, each carrying the hreflang
 * alternates (ja, en, x-default) of the whole set.
 */
function localizedEntries(
  path: string,
  options: Pick<Entry, "changeFrequency" | "priority">,
  locales: readonly Locale[] = LOCALES,
): MetadataRoute.Sitemap {
  // The home page is listed without a trailing slash, as it always was.
  const trim = (url: string) => url.replace(/\/$/, "");
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path, locales)).map(([key, url]) => [
      key,
      trim(url),
    ]),
  );

  return locales.map((locale) => ({
    url: trim(localizedUrl(path, locale)),
    lastModified: new Date(),
    ...options,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, fabricSlugs, journalSlugs] = await Promise.all([
    getAllProductSlugs(),
    getFabricSlugs(),
    getJournalSlugs(),
  ]);

  const staticEntries = STATIC_PATHS.flatMap((path) =>
    localizedEntries(path, {
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
    }),
  );

  const fabricEntries = fabricSlugs.flatMap((slug) =>
    localizedEntries(`/fabric/${slug}`, {
      changeFrequency: "monthly",
      priority: 0.75,
    }),
  );

  // An entry without an English version is listed for Japanese only.
  const journalEntries = journalSlugs.flatMap((slug) =>
    localizedEntries(
      `/journal/${slug}`,
      { changeFrequency: "monthly", priority: 0.65 },
      hasEnglishJournalArticle(slug) ? LOCALES : ["ja"],
    ),
  );

  const productEntries = productSlugs.flatMap((slug) =>
    localizedEntries(`/products/${slug}`, {
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...fabricEntries, ...journalEntries, ...productEntries];
}
