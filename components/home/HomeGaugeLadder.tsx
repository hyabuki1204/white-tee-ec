"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { defineCopy } from "@/lib/i18n/define-copy";
import { useId, useState, type CSSProperties } from "react";
import { formatWeight, type GaugeSpec } from "@/lib/fabric/gauge";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";

export type GaugeLadderItem = GaugeSpec & {
  fabricSlug: string;
  imageUrl: string;
  pieces: Array<{ slug: string; label: string; price: number }>;
};

const getCopy = defineCopy(
  {
    label: "Gauge",
    title: "1インチに、針が何本あるか。",
    lead: "ゲージは編機の針の密度です。数字が大きいほど編目は細かく、生地は薄く、密になります。同じ綿100%の白でも、ゲージが変われば別の服です。",
    tablist: "ゲージを選ぶ",
    imageAlt: (gauge: number) => `${gauge}ゲージの編地の拡大`,
    needlesBefore: "針",
    needlesAfter: "本",
    yarn: "糸",
    structure: "組織",
    weight: "目付",
    about: (gauge: number) => `${gauge}G について`,
  },
  {
    label: "Gauge",
    title: "How many needles in one inch.",
    lead: "Gauge is the density of needles on the knitting machine: needles per inch. The higher the number, the smaller the stitches, and the thinner and denser the cloth. The cotton is the same and the white is the same, but change the gauge and it is a different garment.",
    tablist: "Choose a gauge",
    imageAlt: (gauge: number) => `Close-up of ${gauge}-gauge knitted cloth`,
    needlesBefore: "",
    needlesAfter: "needles",
    yarn: "Yarn",
    structure: "Knit",
    weight: "Weight",
    about: (gauge: number) => `About ${gauge}G`,
  },
);

type HomeGaugeLadderProps = {
  items: GaugeLadderItem[];
  initialGauge?: number;
};

/**
 * The store's organising idea made operable: pick a gauge, see how many
 * needles sit in one inch, then go to the piece.
 */
export function HomeGaugeLadder({ items, initialGauge }: HomeGaugeLadderProps) {
  const baseId = useId();
  const copy = getCopy(useLocale());
  const initialIndex = Math.max(
    0,
    items.findIndex((item) => item.gauge === initialGauge),
  );
  const [index, setIndex] = useState(initialIndex);
  const active = items[index];

  if (!active) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + items.length) % items.length;
    setIndex(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section
      id="gauge"
      aria-label={copy.label}
      className="scroll-mt-[var(--header-height)] bg-[var(--color-ground)] pb-[var(--space-5)] pt-[var(--space-6)] md:pb-[var(--space-6)] md:pt-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
        <h2 className="type-h2 mt-3">{copy.title}</h2>
        <p className="type-body mt-4 max-w-[34em] text-[var(--color-ink-soft)]">
          {copy.lead}
        </p>

        <div
          role="tablist"
          aria-label={copy.tablist}
          onKeyDown={onKeyDown}
          className="mt-[var(--space-4)] flex items-end gap-2 border-b border-[var(--color-ink)] md:mt-[var(--space-5)] md:gap-6"
        >
          {items.map((item, itemIndex) => {
            const selected = itemIndex === index;

            return (
              <button
                key={item.fabricSlug}
                id={`${baseId}-tab-${itemIndex}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "-mb-px border-b-4 px-3 pb-2 pt-3 text-left transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] md:px-5",
                  selected
                    ? "border-[var(--color-navy)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]",
                )}
              >
                <span className="font-en block text-[clamp(40px,9vw,96px)] font-light leading-[0.85] tracking-[-0.04em] tabular-nums">
                  {item.gauge}
                  <span className="ml-1 text-[0.3em] font-normal tracking-[0.04em]">
                    G
                  </span>
                </span>
                <span className="type-label mt-2 block !text-current">
                  {item.character}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          className="mt-[var(--space-4)] grid gap-10 md:mt-[var(--space-5)] md:grid-cols-12 md:gap-0"
        >
          <div className="md:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)]">
              {items.map((item, itemIndex) => (
                <Image
                  key={item.fabricSlug}
                  src={item.imageUrl}
                  alt={itemIndex === index ? copy.imageAlt(item.gauge) : ""}
                  aria-hidden={itemIndex !== index}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    "object-cover transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)]",
                    itemIndex === index ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>

            <div className="mt-5">
              <div
                className="needle-ruler h-10 border-x border-[var(--color-ink)] text-[var(--color-ink)]"
                style={{ "--gauge": active.gauge } as CSSProperties}
                aria-hidden
              />
              <p className="type-caption mt-2 flex justify-between">
                <span className="font-en">1 inch</span>
                <span>
                  {copy.needlesBefore}
                  <span className="font-en mx-1 text-[var(--color-ink)] tabular-nums">
                    {active.gauge}
                  </span>
                  {copy.needlesAfter}
                </span>
              </p>
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <h3 className="type-h2">{active.headline}</h3>
            <div className="mt-4 space-y-1">
              {active.lines.map((line) => (
                <p key={line} className="type-body text-[var(--color-ink-soft)]">
                  {line}
                </p>
              ))}
            </div>

            <dl className="mt-8 border-t border-[var(--color-hairline)]">
              {[
                [copy.yarn, active.yarn],
                [copy.structure, active.structure],
                [copy.weight, formatWeight(active)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex gap-6 border-b border-[var(--color-hairline)] py-3"
                >
                  <dt className="type-body w-16 shrink-0 text-[var(--color-ink-soft)]">
                    {label}
                  </dt>
                  <dd className="type-body text-[var(--color-ink)]">{value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {active.pieces.map((piece, pieceIndex) => (
                <li key={piece.slug}>
                  <Link
                    href={`/products/${piece.slug}`}
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-4 border px-5 transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                      pieceIndex === 0
                        ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white hover:bg-[var(--color-ink)] hover:border-[var(--color-ink)]"
                        : "border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white",
                    )}
                  >
                    <span className="font-en text-[15px] tracking-[0.04em]">
                      {piece.label}
                    </span>
                    <span className="font-en text-[13px] tabular-nums opacity-80">
                      {formatPrice(piece.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/fabric/${active.fabricSlug}`}
              className="type-label mt-6 inline-flex border-b border-[var(--color-ink)] pb-1 !text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
            >
              {copy.about(active.gauge)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
