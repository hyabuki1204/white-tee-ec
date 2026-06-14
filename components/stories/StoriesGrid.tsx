import { StoryCard } from "@/components/stories/StoryCard";
import type { StoryEntryContent } from "@/types/site-content";

type StoriesGridProps = {
  stories: StoryEntryContent[];
};

export function StoriesGrid({ stories }: StoriesGridProps) {
  return (
    <ul className="mt-16 flex w-full flex-col gap-20 sm:mt-24 sm:gap-28 md:mt-32 md:gap-36 lg:mt-40 lg:gap-40">
      {stories.map((story) => (
        <li key={story.id}>
          <StoryCard story={story} />
        </li>
      ))}
    </ul>
  );
}
