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
    </article>
  );
}
