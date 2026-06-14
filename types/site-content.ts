export type HomePageContent = {
  heroImage: string;
  heroCopy: string;
  conceptLines: [string, string];
  featuredProductCount: number;
  fabricPreviewCount: number;
  fabricIntroLines: [string, string];
  /** Empty array = auto algorithm in pickFeaturedProducts */
  featuredProductSlugs: string[];
};

export type AboutPageContent = {
  headline: string;
  bodyParagraphs: string[][];
};

export type StoryEntryContent = {
  id: string;
  title: string;
  lines: string[];
  imageUrl: string;
  imageAlt: string;
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
  legal: LegalBusinessContent;
  contact: ContactPageContent;
  shipping: PolicyPageContent;
  privacy: PolicyPageContent;
  terms: PolicyPageContent;
  seo: SeoSettingsContent;
};
