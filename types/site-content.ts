export type HomePageContent = {
  heroImage: string;
  heroCopy: string;
  conceptLines: [string, string];
  featuredProductCount: number;
  fabricPreviewCount: number;
  fabricIntroLines: [string, string];
  /** Empty array = auto algorithm in pickFeaturedProducts */
  featuredProductSlugs: string[];
  /** Graphpaper hero carousel — empty falls back to static defaults */
  heroCarouselImages: string[];
  announcementMessage: string;
  announcementLinkHref: string;
  announcementLinkLabel: string;
};

export type JournalArticleContent = {
  slug: string;
  title: string;
  /** ISO date string for sorting and display */
  publishedAt: string;
  excerpt: string;
  /** One-line Japanese helper under excerpt */
  helperJa?: string | null;
  heroImage: string;
  heroImageAlt: string;
  featured?: boolean;
  body: string[];
};

export type JournalPageContent = {
  pageTitle: string;
  introLines: [string, string];
  articles: JournalArticleContent[];
};

export type AboutPageContent = {
  headline: string;
  headlineJa?: string | null;
  bodyParagraphs: string[][];
  bodyParagraphsJa?: string[][] | null;
  /** One-line Japanese summary at the end. */
  helperJa?: string | null;
};

export type StoryEntryContent = {
  id: string;
  title: string;
  lines: string[];
  imageUrl: string;
  imageAlt: string;
  /** One-line Japanese summary below English copy. */
  helperJa?: string | null;
};

export type StoriesPageContent = {
  pageTitle: string;
  introLines: [string, string];
  entries: StoryEntryContent[];
};

export type PolicySection = {
  title: string;
  body: string;
};

export type PolicyPageContent = {
  pageTitle: string;
  sections: PolicySection[];
};

export type LegalBusinessContent = {
  operator: string;
  address: string;
  email: string;
  phone: string;
};

export type ContactPageContent = {
  introLines: [string, string];
  email: string;
  hours: string;
};

export type SeoSettingsContent = {
  siteName: string;
  siteDescription: string;
  defaultOgpImage: string;
  twitterHandle: string | null;
};

export type SiteContentKey =
  | "home"
  | "about"
  | "stories"
  | "journal"
  | "legal"
  | "contact"
  | "shipping"
  | "privacy"
  | "terms"
  | "seo";

export type SiteContentMap = {
  home: HomePageContent;
  about: AboutPageContent;
  stories: StoriesPageContent;
  journal: JournalPageContent;
  legal: LegalBusinessContent;
  contact: ContactPageContent;
  shipping: PolicyPageContent;
  privacy: PolicyPageContent;
  terms: PolicyPageContent;
  seo: SeoSettingsContent;
};
