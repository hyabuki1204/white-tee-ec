import Image from "next/image";
import Link from "next/link";

const MILL = {
  label: "Mill",
  quote: ["同じ機械でも、", "同じ生地は生まれない。"],
  lines: [
    "丸編機は自動で動きます。それでも、いい生地になるかどうかは人で決まります。",
    "糸のわずかな張り、針のクセ、耳で聞く機械の音。和歌山の工場で、毎日それを見ている職人が編んでいます。",
  ],
  facts: [
    { value: "1964", unit: "", label: "和歌山市で創業" },
    { value: "36–46", unit: "G", label: "得意とするハイゲージ" },
    { value: "60", unit: "%+", label: "別注でつくる糸の割合" },
  ],
  images: [
    { src: "/mill/yarn.jpg", alt: "生成りの糸を巻いたコーンの拡大", caption: "糸" },
    { src: "/mill/fabric.jpg", alt: "編機から下りてくる編み上がった生地", caption: "編立" },
    { src: "/mill/hands.jpg", alt: "給糸口に糸を通す職人の手", caption: "手" },
  ],
  cta: "工場について",
} as const;

/** Dark band: the mill is shown dark so the product, shown light, reads as its output. */
export function HomeMill() {
  return (
    <section aria-label="Mill" className="on-mill py-[var(--space-6)] md:py-[var(--space-7)]">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <p className="type-label">{MILL.label}</p>

        <div className="relative mt-[var(--space-3)] aspect-[4/5] overflow-hidden bg-[var(--color-mill-soft)] sm:aspect-[3/2]">
          <Image
            src="/mill/machine.jpg"
            alt="下から見上げた丸編機。円周に並ぶ給糸口と赤い表示灯"
            fill
            sizes="(max-width: 1280px) 100vw, 1184px"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,rgba(13,16,20,0.78)_0%,rgba(13,16,20,0.1)_55%)]"
          />
          <h2 className="type-display absolute inset-x-6 bottom-8 !text-white md:inset-x-12 md:bottom-12">
            {MILL.quote.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="mt-[var(--space-4)] grid gap-10 md:mt-[var(--space-5)] md:grid-cols-12 md:gap-0">
          <div className="space-y-3 md:col-span-5">
            {MILL.lines.map((line) => (
              <p key={line} className="type-body text-[var(--color-ink-soft)]">
                {line}
              </p>
            ))}
            <Link
              href="/about"
              className="!mt-8 inline-flex min-h-12 items-center justify-center border border-white px-10 text-[13px] tracking-[0.16em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-white hover:text-[#15181c]"
            >
              {MILL.cta}
            </Link>
          </div>

          <dl className="grid grid-cols-3 gap-4 md:col-span-6 md:col-start-7">
            {MILL.facts.map((fact) => (
              <div key={fact.label} className="border-t border-[var(--color-hairline)] pt-4">
                <dd className="font-en text-[clamp(28px,4.4vw,56px)] font-light leading-none tracking-[-0.03em] tabular-nums">
                  {fact.value}
                  <span className="ml-0.5 text-[0.4em] tracking-normal">{fact.unit}</span>
                </dd>
                <dt className="type-caption mt-3">{fact.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <ul className="mt-[var(--space-5)] grid grid-cols-3 gap-2 md:gap-4">
          {MILL.images.map((image) => (
            <li key={image.src}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-mill-soft)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 380px"
                  className="object-cover"
                />
              </div>
              <p className="type-caption mt-3">{image.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
