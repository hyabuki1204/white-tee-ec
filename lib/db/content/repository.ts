import "server-only";

import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_HOME_CONTENT,
  DEFAULT_STORIES_CONTENT,
} from "@/lib/content/defaults";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { getDataSource, isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AboutPageContent,
  HomePageContent,
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

  return {
    heroImage: input.heroImage ?? DEFAULT_HOME_CONTENT.heroImage,
    heroCopy: input.heroCopy ?? DEFAULT_HOME_CONTENT.heroCopy,
    conceptLines,
    featuredProductCount:
      input.featuredProductCount ?? DEFAULT_HOME_CONTENT.featuredProductCount,
  };
}

function mergeAboutContent(raw: unknown): AboutPageContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_ABOUT_CONTENT;
  }

  const input = raw as Partial<AboutPageContent>;

  return {
    headline: input.headline ?? DEFAULT_ABOUT_CONTENT.headline,
    bodyParagraphs: input.bodyParagraphs ?? DEFAULT_ABOUT_CONTENT.bodyParagraphs,
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

  return {
    pageTitle: input.pageTitle ?? DEFAULT_STORIES_CONTENT.pageTitle,
    introLines,
    entries: input.entries ?? DEFAULT_STORIES_CONTENT.entries,
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
  const [home, about, stories] = await Promise.all([
    getSiteContent("home"),
    getSiteContent("about"),
    getSiteContent("stories"),
  ]);

  return { home, about, stories };
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
