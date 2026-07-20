import Link from "next/link";
import { STORE_GUIDE_SECTIONS } from "@/lib/store-ui/store-guide";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const copy = GRAPHPAPER_STORE_COPY.pdp;

export function PdpStoreGuide() {
  return (
    <section
      aria-label={copy.storeGuideTitle}
      className="border-t border-neutral-200/60 pt-10 sm:pt-12"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="type-label text-neutral-600">
          {copy.storeGuideTitle}
        </h2>
        <Link
          href="/store-guide"
          className="text-[11px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity hover:opacity-60"
        >
          すべて見る
        </Link>
      </div>

      <ul className="mt-6 space-y-5">
        {STORE_GUIDE_SECTIONS.map((section) => (
          <li key={section.id} className="space-y-1.5">
            <p className="text-[12px] font-normal tracking-[0.08em] text-neutral-600">
              {section.title}
            </p>
            <p className="text-[12px] font-normal leading-[1.85] tracking-[0.03em] text-neutral-600">
              {section.summary}
            </p>
            {section.href && section.linkLabel ? (
              <Link
                href={section.href}
                className="inline-block pt-0.5 text-[11px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity hover:opacity-60"
              >
                {section.linkLabel}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
