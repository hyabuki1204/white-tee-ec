"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { formatWeight, type GaugeSpec } from "@/lib/fabric/gauge";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";

export type GaugeLadderItem = GaugeSpec & {
  fabricSlug: string;
  imageUrl: string;
  pieces: Array<{ slug: string; label: string; price: number }>;
};

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
      aria-label="Gauge"
      className="scroll-mt-[var(--header-height)] bg-[var(--color-ground)] pb-[var(--space-5)] pt-[var(--space-6)] md:pb-[var(--space-6)] md:pt-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <p className="type-label !text-[var(--color-navy)]">Gauge</p>
        <h2 className="type-h2 mt-3">1インチに、針が何本あるか。</h2>
        <p className="type-body mt-4 max-w-[34em] text-[var(--color-ink-soft)]">
          ゲージは編機の針の密度です。数字が大きいほど編目は細かく、生地は薄く、密になります。同じ綿100%の白でも、ゲージが変われば別の服です。
        </p>

        <div
          role="tablist"
          aria-label="ゲージを選ぶ"
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
                  alt={itemIndex === index ? `${item.gauge}ゲージの編地の拡大` : ""}
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
                  針
                  <span className="font-en mx-1 text-[var(--color-ink)] tabular-nums">
                    {active.gauge}
                  </span>
                  本
                </span>
              </p>
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <h3 className="type-h2">{active.headlineJa}</h3>
            <div className="mt-4 space-y-1">
              {active.linesJa.map((line) => (
                <p key={line} className="type-body text-[var(--color-ink-soft)]">
                  {line}
                </p>
              ))}
            </div>

            <dl className="mt-8 border-t border-[var(--color-hairline)]">
              {[
                ["糸", active.yarn],
                ["組織", active.structure],
                ["目付", formatWeight(active)],
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
              {active.gauge}G について
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
