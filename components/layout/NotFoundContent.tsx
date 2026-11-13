"use client";

import { Link } from "@/components/i18n/Link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getGaugeLadder } from "@/lib/fabric/gauge";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  pageGutterClass,
} from "@/lib/store-ui/ui-classes";

type NotFoundContentProps = {
  /** `product` for an unknown product slug, `page` for everything else. */
  variant?: "page" | "product";
};

/**
 * 404 screen. The one oversized numeral on the page is the status code;
 * below it, the three gauges give a way back into the store.
 *
 * `not-found.tsx` receives no route params, so the locale comes from the
 * provider in the root layout (which is why this is a client component).
 */
export function NotFoundContent({ variant = "page" }: NotFoundContentProps) {
  const locale = useLocale();
  const copy = getStoreCopy(locale).states.notFound;
  const title = variant === "product" ? copy.productTitle : copy.title;
  const message = variant === "product" ? copy.productMessage : copy.message;

  return (
    <section className="bg-[var(--color-surface)]">
      <div
        className={`${pageGutterClass} grid gap-12 py-[var(--space-5)] md:grid-cols-12 md:items-end md:gap-0 md:py-[var(--space-6)]`}
      >
        <div className="md:col-span-7">
          <p className="type-label !text-[var(--color-navy)]">{copy.eyebrow}</p>
          <p
            aria-hidden
            className="type-numeral mt-6 text-[var(--color-ink)]"
          >
            {copy.label}
          </p>
          <h1 className="type-display mt-8">{title}</h1>
          <p className="type-body mt-5 max-w-[34em] text-[var(--color-ink-soft)]">
            {message}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className={buttonPrimaryClass}>
              {copy.viewCollection}
            </Link>
            <Link href="/" className={buttonSecondaryClass}>
              {copy.back}
            </Link>
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <p className="type-caption">{copy.findByGauge}</p>
          <ul className="mt-3 border-t border-[var(--color-ink)]">
            {getGaugeLadder(locale).map((spec) => (
              <li
                key={spec.fabricSlug}
                className="border-b border-[var(--color-hairline)]"
              >
                <Link
                  href={`/fabric/${spec.fabricSlug}`}
                  className="group flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="font-en text-[28px] font-light leading-none tracking-[-0.02em] tabular-nums text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] group-hover:text-[var(--color-navy)]">
                    {spec.gauge}
                    <span className="ml-0.5 text-[0.5em] tracking-normal">G</span>
                  </span>
                  <span className="type-caption text-right">
                    {spec.headline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
