import Image from "next/image";
import Link from "next/link";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { CREDIBILITY_IMAGES } from "@/lib/store-ui/credibility";
import { STORE_TYPO } from "@/lib/store-ui/typography";

const FABRIC_COPY = {
  label: "FABRIC",
  title: "生地から始まる白。",
  lines: [
    "和歌山の丸編み機で、用途ごとにゲージを調えた6種類のジャージー。",
    "厚み・透け・落ち感は、それぞれがはっきり違う。",
    "一枚着か重ね着か——まず生地から選んでください。",
  ],
  cta: "生地について",
} as const;

export function HomeFabricIntro() {
  return (
    <section
      aria-label="Fabric"
      className="bg-[var(--color-surface)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-12 md:items-center md:gap-0 md:px-8 lg:px-12">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-image-placeholder)] md:col-span-7">
          <Image
            src={CREDIBILITY_IMAGES.factory}
            alt="和歌山の編み工場"
            fill
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-cover"
          />
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <HomeSectionHeading
            label={FABRIC_COPY.label}
            title={FABRIC_COPY.title}
          />
          <div className="mt-[var(--space-3)] max-w-md space-y-2">
            {FABRIC_COPY.lines.map((line) => (
              <p key={line} className={STORE_TYPO.body}>
                {line}
              </p>
            ))}
          </div>
          <Link
            href="/fabric"
            className="mt-[var(--space-4)] inline-flex border-b border-[var(--color-ink)] pb-1 type-label text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
          >
            {FABRIC_COPY.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
