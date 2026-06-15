import Image from "next/image";
import Link from "next/link";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { getStoryLink } from "@/lib/stories/links";
import type { StoryEntryContent } from "@/types/site-content";

type StoryCardProps = {
  story: StoryEntryContent;
};

export function StoryCard({ story }: StoryCardProps) {
  const storyLink = getStoryLink(story.id);

  return (
    <article className="flex w-full flex-col items-center text-center">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
        <Image
          src={story.imageUrl}
          alt={story.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover object-center brightness-[0.96] contrast-[0.98]"
        />
      </div>

      <h2 className="mt-8 text-[13px] font-light tracking-[0.12em] text-neutral-800 sm:mt-10 md:mt-12 md:text-xs md:tracking-[0.14em]">
        {story.title}
      </h2>

      <p className="mt-4 max-w-xs text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 sm:mt-5 md:mt-6 md:text-xs md:leading-[2.15] md:tracking-[0.03em] md:text-neutral-500">
        {story.lines.map((line, index) => (
          <span key={line}>
            {line}
            {index < story.lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
      {story.helperJa ? (
        <JaHelperText spacing="default" className="mx-auto">
          {story.helperJa}
        </JaHelperText>
      ) : null}

      {storyLink ? (
        <Link
          href={storyLink.href}
          className="mt-8 text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity duration-300 hover:opacity-60 md:mt-10"
        >
          {storyLink.label}
        </Link>
      ) : null}
    </article>
  );
}
