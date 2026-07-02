import {
  ABOUT_BODY_PARAGRAPHS,
  ABOUT_BODY_PARAGRAPHS_JA,
  ABOUT_HEADLINE,
  ABOUT_HEADLINE_JA,
} from "@/lib/about/content";
import {
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_SHIPPING_CONTENT,
  DEFAULT_TERMS_CONTENT,
} from "@/lib/legal/defaults";
import {
  FEATURED_PRODUCT_COUNT,
  HOME_CONCEPT_LINES,
  HOME_FABRIC_PREVIEW_COUNT,
  HOME_HERO_COPY,
  HOME_HERO_IMAGE,
} from "@/lib/home/content";
import { FABRIC_INTRO_LINES } from "@/lib/fabric/content";
import { ABOUT_JA_HELPER, STORY_JA_HELPERS } from "@/lib/i18n/ja-helpers";
import {
  STORIES_INTRO_LINES,
  STORIES_PAGE_TITLE,
  STORY_ENTRIES,
} from "@/lib/stories/content";
import { DEFAULT_SEO_CONTENT } from "@/lib/seo/defaults";
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
  fabricPreviewCount: HOME_FABRIC_PREVIEW_COUNT,
  fabricIntroLines: [...FABRIC_INTRO_LINES],
  featuredProductSlugs: [],
};

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  headline: ABOUT_HEADLINE,
  headlineJa: ABOUT_HEADLINE_JA,
  bodyParagraphs: ABOUT_BODY_PARAGRAPHS.map((paragraph) => [...paragraph]),
  bodyParagraphsJa: ABOUT_BODY_PARAGRAPHS_JA.map((paragraph) => [...paragraph]),
  helperJa: ABOUT_JA_HELPER,
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
    helperJa: STORY_JA_HELPERS[entry.id] ?? null,
  })),
};

export const DEFAULT_SITE_CONTENT: SiteContentMap = {
  home: DEFAULT_HOME_CONTENT,
  about: DEFAULT_ABOUT_CONTENT,
  stories: DEFAULT_STORIES_CONTENT,
  legal: DEFAULT_LEGAL_CONTENT,
  contact: DEFAULT_CONTACT_CONTENT,
  shipping: DEFAULT_SHIPPING_CONTENT,
  privacy: DEFAULT_PRIVACY_CONTENT,
  terms: DEFAULT_TERMS_CONTENT,
  seo: DEFAULT_SEO_CONTENT,
};

export {
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_SHIPPING_CONTENT,
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_TERMS_CONTENT,
} from "@/lib/legal/defaults";
