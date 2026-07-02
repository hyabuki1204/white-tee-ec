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
    <section aria-label="Credibility" className="border-t border-[#e8e8e6]">
      <div className="mx-auto w-full max-w-7xl px-8 py-20 md:px-16 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="space-y-3">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f4f2]">
              <Image
                src={CREDIBILITY_IMAGES.factory}
                alt="Knitting floor in Wakayama"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f4f2]">
                <Image
                  src={CREDIBILITY_IMAGES.wear}
                  alt="White tee after months of wear"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f4f2]">
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
              <p className="text-[11px] font-light tracking-[0.2em] text-[#9a9a9a]">
                {HOME_CREDIBILITY.voicesTitle}
              </p>
              <ul className="mt-6 space-y-8">
                {EDITORIAL_VOICES.map((voice) => (
                  <li key={voice.source} className="space-y-2">
                    <p className="text-[10px] font-light tracking-[0.12em] text-[#9a9a9a]">
                      {voice.source}
                      {voice.detail ? (
                        <span className="text-[#c8c8c6]"> · {voice.detail}</span>
                      ) : null}
                    </p>
                    <p className="text-[11px] font-light leading-[1.95] tracking-[0.04em] text-[#6c6c6c] md:text-[12px]">
                      {voice.line}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-light tracking-[0.2em] text-[#9a9a9a]">
                {HOME_CREDIBILITY.wearingTitle}
              </p>
              <ul className="mt-6 space-y-8">
                {WEARING_NOTES.map((note) => (
                  <li key={note.fabric} className="space-y-2">
                    <p className="text-[10px] font-light tracking-[0.1em] text-[#9a9a9a]">
                      {note.fabric}
                      <span className="text-[#c8c8c6]"> · {note.months}か月</span>
                    </p>
                    {note.lines.map((line) => (
                      <p
                        key={line}
                        className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-[#6c6c6c]"
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
                  <dt className="text-[10px] font-light tracking-[0.12em] text-[#9a9a9a]">
                    {fact.label}
                  </dt>
                  <dd className="text-[11px] font-light tracking-[0.04em] text-[#6c6c6c]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              <Link
                href="/stockist"
                className="text-[11px] font-light tracking-[0.08em] text-[#6c6c6c] transition-opacity hover:opacity-60"
              >
                {HOME_CREDIBILITY.stockistLink}
              </Link>
              <Link
                href="/journal"
                className="text-[11px] font-light tracking-[0.08em] text-[#9a9a9a] transition-opacity hover:opacity-60"
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
