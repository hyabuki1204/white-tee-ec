import Image from "next/image";
import type { StoryEntryContent } from "@/types/site-content";

type StoryCardProps = {
  story: StoryEntryContent;
};

export function StoryCard({ story }: StoryCardProps) {
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

      <h2 className="mt-10 text-xs font-light tracking-[0.14em] text-neutral-800 md:mt-12">
        {story.title}
      </h2>

      <p className="mt-5 max-w-xs text-xs font-light leading-[2.15] tracking-[0.03em] text-neutral-500 md:mt-6">
        {story.lines.map((line, index) => (
          <span key={line}>
            {line}
            {index < story.lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </article>
  );
}
