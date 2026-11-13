import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { getGaugeLadder } from "@/lib/fabric/gauge";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";

const HERO = {
  poster: "/home/hero-46g.jpg",
  video: "/home/hero-46g.mp4",
  gauge: 46,
} as const;

const getHeroCopy = defineCopy(
  {
    sectionLabel: "Introduction",
    headline: "白は、ゲージで選ぶ。",
    subline:
      "1964年創業、和歌山。ハイゲージの丸編機で、白いTシャツだけを作っています。",
    cta: "ゲージから選ぶ",
    strapline: "Knitted in Wakayama, Japan — Since 1964",
  },
  {
    sectionLabel: "Introduction",
    headline: "Choose your white by gauge.",
    subline:
      "Wakayama, Japan, since 1964. On high-gauge circular knitting machines, we make white T-shirts and nothing else.",
    cta: "Choose by gauge",
    strapline: "Knitted in Wakayama, Japan — Since 1964",
  },
);

type HomeHeroProps = {
  locale: Locale;
  priceRange: string;
};

export function HomeHero({ locale, priceRange }: HomeHeroProps) {
  const copy = getHeroCopy(locale);

  return (
    <section
      aria-label={copy.sectionLabel}
      className="bg-[var(--color-surface)] px-3 md:px-8 lg:px-12"
    >
      <div className="on-mill relative mx-auto flex min-h-[min(78svh,820px)] w-full max-w-[1680px] items-end overflow-hidden">
        <Image
          src={HERO.poster}
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-[72%_center] md:object-center"
        />
        {/* Decorative loop; the poster above is the LCP image and the reduced-motion fallback. */}
        <video
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] motion-reduce:hidden md:object-center"
          src={HERO.video}
          poster={HERO.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,16,20,0.82)_0%,rgba(13,16,20,0.42)_46%,rgba(13,16,20,0)_72%)] max-md:bg-[linear-gradient(0deg,rgba(13,16,20,0.9)_0%,rgba(13,16,20,0.5)_45%,rgba(13,16,20,0.05)_75%)]"
        />

        <div className="relative z-10 w-full px-6 pb-10 pt-40 md:px-14 md:pb-16 lg:px-20 lg:pb-20">
          <p className="type-numeral" aria-hidden>
            {HERO.gauge}
            <small>G</small>
          </p>
          <h1 className="type-display mt-6 !text-white md:mt-8">
            {copy.headline}
          </h1>
          <p className="type-body mt-4 max-w-[26em] text-white/80">
            {copy.subline}
          </p>
          <Link
            href="#gauge"
            className="mt-8 inline-flex min-h-12 items-center justify-center border border-white px-10 text-[13px] tracking-[0.16em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-white hover:text-[#15181c]"
          >
            {copy.cta}
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1680px] flex-wrap items-center justify-between gap-x-8 gap-y-2 py-5">
        <p className="type-label">{copy.strapline}</p>
        <p className="type-label flex items-center gap-4 tabular-nums">
          {getGaugeLadder(locale).map((item) => (
            <Link
              key={item.fabricSlug}
              href={`/fabric/${item.fabricSlug}`}
              className="text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
            >
              {item.gauge}G
            </Link>
          ))}
          <span className="text-[var(--color-ink-faint)]">{priceRange}</span>
        </p>
      </div>
    </section>
  );
}
