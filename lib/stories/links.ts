export type StoryLink = {
  href: string;
  label: string;
};

const STORY_LINKS: Record<string, StoryLink> = {
  fabric: { href: "/fabric", label: "Fabric" },
  structure: { href: "/products", label: "Pieces" },
  air: { href: "/fabric", label: "Fabric" },
  process: { href: "/fabric", label: "Fabric" },
};

export function getStoryLink(storyId: string): StoryLink | null {
  return STORY_LINKS[storyId] ?? null;
}

/** Optional secondary link for stories with two exit paths. */
const STORY_SECONDARY_LINKS: Record<string, StoryLink> = {
  process: { href: "/products", label: "Pieces" },
  fabric: { href: "/products", label: "Pieces" },
};

export function getStorySecondaryLink(storyId: string): StoryLink | null {
  return STORY_SECONDARY_LINKS[storyId] ?? null;
}
