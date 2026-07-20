import "server-only";

import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_HOME_CONTENT,
  DEFAULT_JOURNAL_CONTENT,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_SHIPPING_CONTENT,
  DEFAULT_STORIES_CONTENT,
  DEFAULT_TERMS_CONTENT,
} from "@/lib/content/defaults";
import { DEFAULT_SEO_CONTENT } from "@/lib/seo/defaults";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { getDataSource, isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AboutPageContent,
  ContactPageContent,
  HomePageContent,
  JournalPageContent,
  LegalBusinessContent,
  PolicyPageContent,
  SeoSettingsContent,
  SiteContentKey,
  SiteContentMap,
  StoriesPageContent,
} from "@/types/site-content";
import type { Json } from "@/types/database";

function mergeHomeContent(raw: unknown): HomePageContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_HOME_CONTENT;
  }

  const input = raw as Partial<HomePageContent>;
  const conceptLines =
    input.conceptLines && input.conceptLines.length === 2
      ? ([input.conceptLines[0], input.conceptLines[1]] as [string, string])
      : DEFAULT_HOME_CONTENT.conceptLines;
  const fabricIntroLines =
    input.fabricIntroLines && input.fabricIntroLines.length === 2
      ? ([input.fabricIntroLines[0], input.fabricIntroLines[1]] as [
          string,
          string,
        ])
      : DEFAULT_HOME_CONTENT.fabricIntroLines;

  const fabricPreviewCount = Number(input.fabricPreviewCount);
  const safeFabricPreviewCount =
    Number.isInteger(fabricPreviewCount) &&
    fabricPreviewCount >= 1 &&
    fabricPreviewCount <= 12
      ? fabricPreviewCount
      : DEFAULT_HOME_CONTENT.fabricPreviewCount;

  return {
    heroImage: input.heroImage ?? DEFAULT_HOME_CONTENT.heroImage,
    heroCopy: input.heroCopy ?? DEFAULT_HOME_CONTENT.heroCopy,
    conceptLines,
    featuredProductCount:
      input.featuredProductCount ?? DEFAULT_HOME_CONTENT.featuredProductCount,
    fabricPreviewCount: safeFabricPreviewCount,
    fabricIntroLines,
    featuredProductSlugs: Array.isArray(input.featuredProductSlugs)
      ? input.featuredProductSlugs.filter(
          (slug): slug is string => typeof slug === "string",
        )
      : DEFAULT_HOME_CONTENT.featuredProductSlugs,
    heroCarouselImages:
      Array.isArray(input.heroCarouselImages) &&
      input.heroCarouselImages.length > 0
        ? input.heroCarouselImages.filter(
            (src): src is string => typeof src === "string" && src.length > 0,
          )
        : DEFAULT_HOME_CONTENT.heroCarouselImages,
    announcementMessage:
      input.announcementMessage ?? DEFAULT_HOME_CONTENT.announcementMessage,
    announcementLinkHref:
      input.announcementLinkHref ?? DEFAULT_HOME_CONTENT.announcementLinkHref,
    announcementLinkLabel:
      input.announcementLinkLabel ?? DEFAULT_HOME_CONTENT.announcementLinkLabel,
  };
}

function mergeAboutContent(raw: unknown): AboutPageContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_ABOUT_CONTENT;
  }

  const input = raw as Partial<AboutPageContent>;

  return {
    headline: input.headline ?? DEFAULT_ABOUT_CONTENT.headline,
    headlineJa: input.headlineJa ?? DEFAULT_ABOUT_CONTENT.headlineJa,
    bodyParagraphs: input.bodyParagraphs ?? DEFAULT_ABOUT_CONTENT.bodyParagraphs,
    bodyParagraphsJa:
      input.bodyParagraphsJa ?? DEFAULT_ABOUT_CONTENT.bodyParagraphsJa,
    helperJa: input.helperJa ?? DEFAULT_ABOUT_CONTENT.helperJa,
  };
}

function mergeStoriesContent(raw: unknown): StoriesPageContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_STORIES_CONTENT;
  }

  const input = raw as Partial<StoriesPageContent>;
  const introLines =
    input.introLines && input.introLines.length === 2
      ? ([input.introLines[0], input.introLines[1]] as [string, string])
      : DEFAULT_STORIES_CONTENT.introLines;

  const mergeEntry = (
    entry: StoriesPageContent["entries"][number],
  ): StoriesPageContent["entries"][number] => {
    const fallback = DEFAULT_STORIES_CONTENT.entries.find(
      (item) => item.id === entry.id,
    );

    return {
      ...entry,
      helperJa: entry.helperJa ?? fallback?.helperJa ?? null,
    };
  };

  return {
    pageTitle: input.pageTitle ?? DEFAULT_STORIES_CONTENT.pageTitle,
    introLines,
    entries: (input.entries ?? DEFAULT_STORIES_CONTENT.entries).map(mergeEntry),
  };
}

function mergeJournalContent(raw: unknown): JournalPageContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_JOURNAL_CONTENT;
  }

  const input = raw as Partial<JournalPageContent>;
  const introLines =
    input.introLines && input.introLines.length === 2
      ? ([input.introLines[0], input.introLines[1]] as [string, string])
      : DEFAULT_JOURNAL_CONTENT.introLines;

  const mergeArticle = (
    article: JournalPageContent["articles"][number],
  ): JournalPageContent["articles"][number] => {
    const fallback = DEFAULT_JOURNAL_CONTENT.articles.find(
      (item) => item.slug === article.slug,
    );

    return {
      slug: article.slug,
      title: article.title ?? fallback?.title ?? article.slug,
      publishedAt: article.publishedAt ?? fallback?.publishedAt ?? "",
      excerpt: article.excerpt ?? fallback?.excerpt ?? "",
      helperJa: article.helperJa ?? fallback?.helperJa ?? null,
      heroImage: article.heroImage ?? fallback?.heroImage ?? "",
      heroImageAlt: article.heroImageAlt ?? fallback?.heroImageAlt ?? "",
      featured: article.featured ?? fallback?.featured ?? false,
      body: article.body ?? fallback?.body ?? [],
    };
  };

  return {
    pageTitle: input.pageTitle ?? DEFAULT_JOURNAL_CONTENT.pageTitle,
    introLines,
    articles: (input.articles ?? DEFAULT_JOURNAL_CONTENT.articles).map(
      mergeArticle,
    ),
  };
}

function mergeLegalContent(raw: unknown): LegalBusinessContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_LEGAL_CONTENT;
  }

  const input = raw as Partial<LegalBusinessContent>;

  return {
    operator: input.operator ?? DEFAULT_LEGAL_CONTENT.operator,
    address: input.address ?? DEFAULT_LEGAL_CONTENT.address,
    email: input.email ?? DEFAULT_LEGAL_CONTENT.email,
    phone: input.phone ?? DEFAULT_LEGAL_CONTENT.phone,
  };
}

function mergeContactContent(raw: unknown): ContactPageContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_CONTACT_CONTENT;
  }

  const input = raw as Partial<ContactPageContent>;
  const introLines =
    input.introLines && input.introLines.length === 2
      ? ([input.introLines[0], input.introLines[1]] as [string, string])
      : DEFAULT_CONTACT_CONTENT.introLines;

  return {
    introLines,
    email: input.email ?? DEFAULT_CONTACT_CONTENT.email,
    hours: input.hours ?? DEFAULT_CONTACT_CONTENT.hours,
  };
}

function mergePolicyContent(
  raw: unknown,
  defaults: PolicyPageContent,
): PolicyPageContent {
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const input = raw as Partial<PolicyPageContent>;

  return {
    pageTitle: input.pageTitle ?? defaults.pageTitle,
    sections: input.sections ?? defaults.sections,
  };
}

function mergeSeoContent(raw: unknown): SeoSettingsContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_SEO_CONTENT;
  }

  const input = raw as Partial<SeoSettingsContent>;

  return {
    siteName: input.siteName ?? DEFAULT_SEO_CONTENT.siteName,
    siteDescription:
      input.siteDescription ?? DEFAULT_SEO_CONTENT.siteDescription,
    defaultOgpImage:
      input.defaultOgpImage ?? DEFAULT_SEO_CONTENT.defaultOgpImage,
    twitterHandle:
      input.twitterHandle === undefined
        ? DEFAULT_SEO_CONTENT.twitterHandle
        : input.twitterHandle,
  };
}

function mergeContent<K extends SiteContentKey>(
  key: K,
  raw: unknown,
): SiteContentMap[K] {
  switch (key) {
    case "home":
      return mergeHomeContent(raw) as SiteContentMap[K];
    case "about":
      return mergeAboutContent(raw) as SiteContentMap[K];
    case "stories":
      return mergeStoriesContent(raw) as SiteContentMap[K];
    case "journal":
      return mergeJournalContent(raw) as SiteContentMap[K];
    case "legal":
      return mergeLegalContent(raw) as SiteContentMap[K];
    case "contact":
      return mergeContactContent(raw) as SiteContentMap[K];
    case "shipping":
      return mergePolicyContent(raw, DEFAULT_SHIPPING_CONTENT) as SiteContentMap[K];
    case "privacy":
      return mergePolicyContent(raw, DEFAULT_PRIVACY_CONTENT) as SiteContentMap[K];
    case "terms":
      return mergePolicyContent(raw, DEFAULT_TERMS_CONTENT) as SiteContentMap[K];
    case "seo":
      return mergeSeoContent(raw) as SiteContentMap[K];
    default:
      throw new Error(`Unknown content key: ${key satisfies never}`);
  }
}

async function readSiteContentFromSupabase<K extends SiteContentKey>(
  key: K,
): Promise<SiteContentMap[K]> {
  try {
    const supabase = createSupabaseStaticClient();

    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      if (
        error.message.includes("site_content") ||
        error.message.includes("schema cache")
      ) {
        return mergeContent(key, null);
      }

      throw new Error(`Failed to fetch site content (${key}): ${error.message}`);
    }

    return mergeContent(key, data?.content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("site_content") || message.includes("schema cache")) {
      return mergeContent(key, null);
    }

    throw error;
  }
}

export async function getSiteContent<K extends SiteContentKey>(
  key: K,
): Promise<SiteContentMap[K]> {
  if (getDataSource() !== "supabase" || !isSupabaseConfigured()) {
    return mergeContent(key, null);
  }

  return readSiteContentFromSupabase(key);
}

export async function getAllSiteContent(): Promise<SiteContentMap> {
  const [home, about, stories, journal, legal, contact, shipping, privacy, terms, seo] =
    await Promise.all([
      getSiteContent("home"),
      getSiteContent("about"),
      getSiteContent("stories"),
      getSiteContent("journal"),
      getSiteContent("legal"),
      getSiteContent("contact"),
      getSiteContent("shipping"),
      getSiteContent("privacy"),
      getSiteContent("terms"),
      getSiteContent("seo"),
    ]);

  return {
    home,
    about,
    stories,
    journal,
    legal,
    contact,
    shipping,
    privacy,
    terms,
    seo,
  };
}

export async function upsertSiteContent<K extends SiteContentKey>(
  key: K,
  content: SiteContentMap[K],
): Promise<SiteContentMap[K]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot update content: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("site_content")
    .upsert(
      {
        key,
        content: content as unknown as Json,
      },
      { onConflict: "key" },
    )
    .select("content")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to save site content (${key}): ${error?.message ?? "Unknown error"}`,
    );
  }

  return mergeContent(key, data.content);
}
