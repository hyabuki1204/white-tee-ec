import {
  ABOUT_BODY_PARAGRAPHS,
  ABOUT_HEADLINE,
} from "@/lib/about/content";
import {
  FEATURED_PRODUCT_COUNT,
  HOME_CONCEPT_LINES,
  HOME_HERO_COPY,
  HOME_HERO_IMAGE,
} from "@/lib/home/content";
import {
  STORIES_INTRO_LINES,
  STORIES_PAGE_TITLE,
  STORY_ENTRIES,
} from "@/lib/stories/content";
import type {
  AboutPageContent,
  HomePageContent,
  SiteContentMap,
  StoriesPageContent,
} from "@/types/site-content";

export const DEFAULT_HOME_CONTENT: HomePageContent = {
  heroImage: HOME_HERO_IMAGE,
  heroCopy: HOME_HERO_COPY,
  conceptLines: [...HOME_CONCEPT_LINES],
  featuredProductCount: FEATURED_PRODUCT_COUNT,
};

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  headline: ABOUT_HEADLINE,
  bodyParagraphs: ABOUT_BODY_PARAGRAPHS.map((paragraph) => [...paragraph]),
};

export const DEFAULT_STORIES_CONTENT: StoriesPageContent = {
  pageTitle: STORIES_PAGE_TITLE,
  introLines: [...STORIES_INTRO_LINES],
  entries: STORY_ENTRIES.map((entry) => ({
    id: entry.id,
    title: entry.title,
    lines: [...entry.lines],
    imageUrl: entry.imageUrl,
    imageAlt: entry.imageAlt,
  })),
};

export const DEFAULT_SITE_CONTENT: SiteContentMap = {
  home: DEFAULT_HOME_CONTENT,
  about: DEFAULT_ABOUT_CONTENT,
  stories: DEFAULT_STORIES_CONTENT,
};
