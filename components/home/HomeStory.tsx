import Image from "next/image";
import Link from "next/link";
import { HOME_COPY } from "@/lib/store-ui/home-redesign";
import { STORE_TYPO } from "@/lib/store-ui/typography";

export function HomeStory() {
  return (
    <section
      aria-label="Production story"
      className="border-t border-[var(--color-hairline)] bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-8 md:py-20 lg:px-12">
        <div className="mb-10 md:mb-12">
          <p className={STORE_TYPO.editorialLabel}>{HOME_COPY.storySection.label}</p>
          <p className="mt-4 max-w-2xl text-[14px] font-normal leading-[1.9] tracking-[0.04em] text-[var(--color-ink-soft)] md:text-[14px]">
            {HOME_COPY.storySection.intro}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {HOME_COPY.story.map((step) => (
            <article key={step.key} className="flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)]">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-5 space-y-3">
                <p className={STORE_TYPO.editorialLabel}>{step.title}</p>
                <div className="space-y-1">
                  {step.lines.map((line) => (
                    <p
                      key={line}
                      className="text-[14px] font-normal leading-[1.8] tracking-[0.06em] text-[var(--color-ink-soft)] md:text-[14px]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4 md:mt-14">
          <Link
            href="/fabric"
            className="inline-flex min-h-11 items-center border border-neutral-300 px-6 py-3 text-[12px] font-normal tracking-[0.14em] text-neutral-700 transition-colors hover:border-neutral-800 hover:text-neutral-900"
          >
            {HOME_COPY.storySection.fabricCta}
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center text-[12px] font-normal tracking-[0.12em] text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60"
          >
            {HOME_COPY.storySection.aboutCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
