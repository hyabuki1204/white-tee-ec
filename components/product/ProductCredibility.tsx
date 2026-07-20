import Link from "next/link";
import {
  EDITORIAL_VOICES,
  HOME_CREDIBILITY,
  PDP_CREDIBILITY,
  PRICE_POSITIONING,
  getWearingNoteForFabric,
} from "@/lib/store-ui/credibility";

type ProductCredibilityProps = {
  fabricName?: string | null;
};

export function ProductCredibility({ fabricName }: ProductCredibilityProps) {
  const wearingNote = getWearingNoteForFabric(fabricName);

  return (
    <section
      aria-label="Credibility"
      className="space-y-6 border-t border-neutral-200/50 pt-6"
    >
      <div>
        <h2 className="text-[11px] font-light uppercase tracking-[0.16em] text-neutral-600">
          {PDP_CREDIBILITY.voicesTitle}
        </h2>
        <ul className="mt-4 space-y-5">
          {EDITORIAL_VOICES.slice(0, 2).map((voice) => (
            <li key={voice.source} className="space-y-1.5">
              <p className="text-[11px] font-light tracking-[0.1em] text-neutral-600">
                {voice.source}
              </p>
              <p className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600">
                {voice.line}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {wearingNote ? (
        <div>
          <h2 className="text-[11px] font-light uppercase tracking-[0.16em] text-neutral-600">
            {PDP_CREDIBILITY.wearingTitle}
          </h2>
          <p className="mt-3 text-[11px] font-light tracking-[0.08em] text-neutral-600">
            {wearingNote.fabric} · {wearingNote.months}か月着用
          </p>
          <div className="mt-3 space-y-2">
            {wearingNote.lines.map((line) => (
              <p
                key={line}
                className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-[11px] font-light uppercase tracking-[0.16em] text-neutral-600">
          {PDP_CREDIBILITY.priceTitle}
        </h2>
        <p className="mt-3 text-[11px] font-light leading-[1.95] tracking-[0.04em] text-neutral-600">
          {PRICE_POSITIONING.intro}
        </p>
        <p className="mt-3 text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600">
          {PRICE_POSITIONING.rangeTemplate}
        </p>
        <p className="mt-3 text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600">
          {PRICE_POSITIONING.care}
        </p>
        <Link
          href="/stockist"
          className="mt-4 inline-block text-[11px] font-light tracking-[0.08em] text-neutral-600 transition-opacity hover:opacity-60"
        >
          {HOME_CREDIBILITY.stockistLink}
        </Link>
      </div>
    </section>
  );
}
