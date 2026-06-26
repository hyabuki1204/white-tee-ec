import Image from "next/image";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";

export function HomeStory() {
  return (
    <section aria-label="Production story">
      {HOME_COPY.story.map((step, index) => (
        <article
          key={step.key}
          className="relative flex min-h-screen flex-col border-t border-[#e8e8e6]"
        >
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={step.image}
              alt=""
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 px-8 pb-16 md:px-16 md:pb-[120px]">
            <div className="mx-auto w-full max-w-7xl">
              <p className="text-[11px] font-light tracking-[0.2em] text-[#9a9a9a]">
                {step.title}
              </p>
              {step.lines.map((line) => (
                <p
                  key={line}
                  className="mt-4 text-[11px] font-light leading-[1.9] tracking-[0.04em] text-[#6c6c6c] md:text-[12px]"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
