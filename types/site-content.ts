export type HomePageContent = {
  heroImage: string;
  heroCopy: string;
  conceptLines: [string, string];
  featuredProductCount: number;
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

export type SiteContentKey = "home" | "about" | "stories";

export type SiteContentMap = {
  home: HomePageContent;
  about: AboutPageContent;
  stories: StoriesPageContent;
};
