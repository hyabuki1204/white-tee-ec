export type StoryLink = {
  href: string;
  label: string;
};

const STORY_LINKS: Record<string, StoryLink> = {
  fabric: { href: "/fabric", label: "Explore fabric" },
  structure: { href: "/products", label: "View pieces" },
  air: { href: "/fabric", label: "Explore fabric" },
  process: { href: "/about", label: "About the process" },
};

export function getStoryLink(storyId: string): StoryLink | null {
  return STORY_LINKS[storyId] ?? null;
}
