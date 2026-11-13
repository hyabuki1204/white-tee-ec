import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";

type AboutContentProps = {
  locale: Locale;
  /** Closing statement: headline, paragraphs (lines), one-line note. */
  headline?: string | null;
  paragraphs: readonly (readonly string[])[];
  helper?: string | null;
};

const PROCESS_IMAGES = [
  "/mill/yarn.jpg",
  "/mill/ring.jpg",
  "/mill/hands.jpg",
  "/mill/fabric.jpg",
] as const;

const getMillPage = defineCopy(
  {
    label: "Mill",
    heroAlt: "丸編機のシリンダーに並ぶ針と、集まっていく糸",
    plateAlt: "煉瓦の壁に掛かる工場の表札",
    title: ["和歌山の、", "編む工場から。"],
    intro:
      "和歌山は、丸編みニットの産地です。その和歌山市で1964年から、他にない編地を作り続けてきた工場が、白いTシャツだけを作っています。",
    process: [
      {
        step: "Yarn",
        title: "糸を決める",
        alt: "生成りの糸を巻いたコーンの拡大",
        lines: [
          "白は、糸の毛羽と撚りがそのまま表面に出ます。",
          "ゲージごとに番手と紡績方法を変え、編む前に白の表情を決めます。",
        ],
      },
      {
        step: "Knit",
        title: "ゲージで編む",
        alt: "針が円周に並ぶ丸編機と、編み上がっていく生地",
        lines: [
          "28、36、46。1インチあたりの針の本数です。",
          "針が増えるほど編目は細かくなり、機械の調整は難しくなります。",
        ],
      },
      {
        step: "Hands",
        title: "人が見る",
        alt: "給糸口に糸を通す職人の手",
        lines: [
          "糸の張り、針のクセ、機械の音。",
          "同じ設定でも、触る人が違えば生地は変わります。",
        ],
      },
      {
        step: "Cloth",
        title: "生地になる",
        alt: "編機から下りてくる編み上がった生地",
        lines: [
          "編み上がった生地を検反し、白く仕上げ、裁断と縫製へ。",
          "糸から一枚になるまで、工程を自分たちで追える距離で作っています。",
        ],
      },
    ],
    facts: [
      { value: "1964", unit: "", label: "創業" },
      { value: "36–46", unit: "G", label: "得意とするハイゲージ" },
      { value: "60", unit: "%+", label: "別注でつくる糸の割合" },
    ],
    credit: "編立：カネマサ莫大小株式会社（和歌山県和歌山市）",
    chooseByGauge: "ゲージから選ぶ",
    stockist: "取扱店",
    processLabel: "Process",
  },
  {
    label: "Mill",
    heroAlt:
      "Needles lined up on the cylinder of a circular knitting machine, with the yarns converging",
    plateAlt: "The mill's nameplate on a brick wall",
    title: ["From a knitting mill", "in Wakayama."],
    intro:
      "Wakayama is a centre of circular knitting. A mill in Wakayama City that has made knitted cloth found nowhere else since 1964 makes white T-shirts, and nothing else.",
    process: [
      {
        step: "Yarn",
        title: "Choose the yarn",
        alt: "Close-up of cones wound with undyed yarn",
        lines: [
          "In white, the fuzz and twist of the yarn show directly on the surface.",
          "Count and spinning method change with each gauge. The character of the white is set before knitting.",
        ],
      },
      {
        step: "Knit",
        title: "Knit by gauge",
        alt: "A circular knitting machine with needles around its circumference, and cloth being knitted",
        lines: [
          "28, 36, 46: needles per inch.",
          "The more needles, the smaller the stitches, and the harder the machine is to adjust.",
        ],
      },
      {
        step: "Hands",
        title: "People watch",
        alt: "A knitter's hands threading yarn through a feeder",
        lines: [
          "Yarn tension, the habits of each needle, the sound of the machine.",
          "With the same settings, the cloth changes with the person at the machine.",
        ],
      },
      {
        step: "Cloth",
        title: "It becomes cloth",
        alt: "Finished cloth coming down from the knitting machine",
        lines: [
          "The knitted cloth is inspected, finished white, then cut and sewn.",
          "From yarn to finished piece, every step is close enough for us to follow ourselves.",
        ],
      },
    ],
    facts: [
      { value: "1964", unit: "", label: "Founded" },
      { value: "36–46", unit: "G", label: "High gauge, the mill's strength" },
      { value: "60", unit: "%+", label: "Share of yarn spun to order" },
    ],
    credit: "Knitted by Kanemasa Knitting Co., Ltd., Wakayama City, Wakayama",
    chooseByGauge: "Choose by gauge",
    stockist: "Stockist",
    processLabel: "Process",
  },
);

export function AboutContent({
  locale,
  headline,
  paragraphs,
  helper,
}: AboutContentProps) {
  const MILL_PAGE = getMillPage(locale);

  return (
    <>
      <section className="bg-[var(--color-surface)] px-3 md:px-8 lg:px-12">
        <div className="on-mill relative mx-auto flex min-h-[min(72svh,760px)] w-full max-w-[1680px] items-end overflow-hidden">
          <Image
            src="/mill/needle.jpg"
            alt={MILL_PAGE.heroAlt}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,rgba(13,16,20,0.85)_0%,rgba(13,16,20,0.25)_60%)]"
          />
          <div className="relative z-10 w-full px-6 pb-10 pt-40 md:px-14 md:pb-16 lg:px-20">
            <p className="type-label">{MILL_PAGE.label}</p>
            <h1 className="type-display mt-4 !text-white">
              {MILL_PAGE.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-[var(--space-6)] md:grid-cols-12 md:gap-0 md:px-8 md:py-[var(--space-7)] lg:px-12">
        <div className="md:col-span-5">
          {headline ? <h2 className="type-h2">{headline}</h2> : null}
          <p className="type-body mt-5 text-[var(--color-ink-soft)]">
            {MILL_PAGE.intro}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 md:col-span-6 md:col-start-7">
          {MILL_PAGE.facts.map((fact) => (
            <div
              key={fact.label}
              className="border-t border-[var(--color-ink)] pt-4"
            >
              <dd className="font-en text-[clamp(28px,4.4vw,56px)] font-light leading-none tracking-[-0.03em] tabular-nums">
                {fact.value}
                <span className="ml-0.5 text-[0.4em] tracking-normal">
                  {fact.unit}
                </span>
              </dd>
              <dt className="type-caption mt-3">{fact.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-label={MILL_PAGE.processLabel}
        className="on-mill py-[var(--space-6)] md:py-[var(--space-7)]"
      >
        <ol className="mx-auto grid w-full max-w-7xl gap-x-6 gap-y-14 px-6 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-12">
          {MILL_PAGE.process.map((item, index) => (
            <li key={item.step}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-mill-soft)]">
                <Image
                  src={PROCESS_IMAGES[index]!}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <p className="type-label mt-5 tabular-nums">
                {String(index + 1).padStart(2, "0")} — {item.step}
              </p>
              <h3 className="type-h2 mt-2">{item.title}</h3>
              <div className="mt-3 space-y-1">
                {item.lines.map((line) => (
                  <p
                    key={line}
                    className="type-body text-[var(--color-ink-soft)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-[var(--space-6)] md:grid-cols-12 md:items-center md:gap-0 md:px-8 md:py-[var(--space-7)] lg:px-12">
        <div className="relative aspect-[3/2] overflow-hidden bg-[var(--color-image-placeholder)] md:col-span-6">
          <Image
            src="/mill/plate.jpg"
            alt={MILL_PAGE.plateAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <div className="space-y-6">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph[0]}
                lang={locale}
                className="type-body text-[var(--color-ink)]"
              >
                {paragraph.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < paragraph.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {helper ? <p className="type-caption mt-6">{helper}</p> : null}

          <div className="mt-10 flex items-center gap-5 border-t border-[var(--color-hairline)] pt-6">
            <Image
              src="/brand/kanemasa-black.svg"
              alt="kanemasa"
              width={134}
              height={50}
              className="h-9 w-auto opacity-80"
            />
            <p className="type-caption">{MILL_PAGE.credit}</p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/#gauge"
              className="inline-flex min-h-12 items-center justify-center bg-[var(--color-navy)] px-10 text-[13px] tracking-[0.16em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-ink)]"
            >
              {MILL_PAGE.chooseByGauge}
            </Link>
            <Link
              href="/stockist"
              className="inline-flex min-h-12 items-center justify-center border border-[var(--color-navy)] px-10 text-[13px] tracking-[0.16em] text-[var(--color-navy)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-navy)] hover:text-white"
            >
              {MILL_PAGE.stockist}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
