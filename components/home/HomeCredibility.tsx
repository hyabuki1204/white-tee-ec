import Image from "next/image";
import Link from "next/link";
import {
  CREDIBILITY_IMAGES,
  EDITORIAL_VOICES,
  FACTS,
  HOME_CREDIBILITY,
  WEARING_NOTES,
} from "@/lib/store-ui/credibility";

export function HomeCredibility() {
  return (
    <section aria-label="Credibility" className="border-t border-[var(--color-hairline)]">
      <div className="mx-auto w-full max-w-7xl px-8 py-20 md:px-16 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="space-y-3">
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-image-placeholder)]">
              <Image
                src={CREDIBILITY_IMAGES.factory}
                alt="Knitting floor in Wakayama"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)]">
                <Image
                  src={CREDIBILITY_IMAGES.wear}
                  alt="White tee after months of wear"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)]">
                <Image
                  src={CREDIBILITY_IMAGES.packaging}
                  alt="Folded white tee packaging"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p className="text-[12px] font-normal tracking-[0.2em] text-[var(--color-ink-soft)]">
                {HOME_CREDIBILITY.voicesTitle}
              </p>
              <ul className="mt-6 space-y-8">
                {EDITORIAL_VOICES.map((voice) => (
                  <li key={voice.source} className="space-y-2">
                    <p className="text-[11px] font-normal tracking-[0.12em] text-[var(--color-ink-soft)]">
                      {voice.source}
                      {voice.detail ? (
                        <span className="text-[var(--color-ink-faint)]"> · {voice.detail}</span>
                      ) : null}
                    </p>
                    <p className="text-[12px] font-normal leading-[1.95] tracking-[0.04em] text-[var(--color-ink-soft)] md:text-[14px]">
                      {voice.line}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[12px] font-normal tracking-[0.2em] text-[var(--color-ink-soft)]">
                {HOME_CREDIBILITY.wearingTitle}
              </p>
              <ul className="mt-6 space-y-8">
                {WEARING_NOTES.map((note) => (
                  <li key={note.fabric} className="space-y-2">
                    <p className="text-[11px] font-normal tracking-[0.1em] text-[var(--color-ink-soft)]">
                      {note.fabric}
                      <span className="text-[var(--color-ink-faint)]"> · {note.months}か月</span>
                    </p>
                    {note.lines.map((line) => (
                      <p
                        key={line}
                        className="text-[12px] font-normal leading-[1.9] tracking-[0.04em] text-[var(--color-ink-soft)]"
                      >
                        {line}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-2 gap-6">
              {FACTS.map((fact) => (
                <div key={fact.label} className="space-y-1">
                  <dt className="text-[11px] font-normal tracking-[0.12em] text-[var(--color-ink-soft)]">
                    {fact.label}
                  </dt>
                  <dd className="text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              <Link
                href="/stockist"
                className="text-[12px] font-normal tracking-[0.08em] text-[var(--color-ink-soft)] transition-opacity hover:opacity-60"
              >
                {HOME_CREDIBILITY.stockistLink}
              </Link>
              <Link
                href="/journal"
                className="text-[12px] font-normal tracking-[0.08em] text-[var(--color-ink-soft)] transition-opacity hover:opacity-60"
              >
                {HOME_CREDIBILITY.journalLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
