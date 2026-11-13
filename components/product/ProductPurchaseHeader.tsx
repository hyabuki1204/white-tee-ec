import { ApproxPrice } from "@/components/currency/ApproxPrice";
import { CurrencySwitch } from "@/components/currency/CurrencySwitch";
import { Link } from "@/components/i18n/Link";
import { getProductCopy } from "@/lib/copy/site-ui";
import { getCurrencyCopy } from "@/lib/currency/copy";
import type { Locale } from "@/lib/i18n/config";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import { SHIPS_WITHIN_JAPAN_ONLY } from "@/lib/store-ui/returns-policy";
import { formatPrice } from "@/lib/utils/format-price";

type ProductPurchaseHeaderProps = {
  locale: Locale;
  displayName: string;
  price: number;
  description: string;
  /** Needles per inch. When present it leads the title as a numeral. */
  gauge?: number | null;
  /** One-word character of the gauge, e.g. "Dense". */
  character?: string | null;
  className?: string;
};

/** Server-rendered PDP title, price, and description. */
export function ProductPurchaseHeader({
  locale,
  displayName,
  price,
  description,
  gauge,
  character,
  className,
}: ProductPurchaseHeaderProps) {
  const copy = getProductCopy(locale);
  const rest = gauge
    ? displayName.replace(new RegExp(`^${gauge}G\\s*`), "")
    : displayName;

  return (
    <header className={className}>
      <nav aria-label="Breadcrumb" className="type-fine font-en">
        <Link
          href="/products"
          className="transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
        >
          {getStoreCopy(locale).nav.products}
        </Link>
        <span aria-hidden className="mx-1.5">
          /
        </span>
        <span>{displayName}</span>
      </nav>

      <h1 className="font-en mt-6 text-[var(--color-ink)]">
        {gauge ? (
          <>
            <span className="block text-[clamp(72px,9vw,128px)] font-light leading-[0.82] tracking-[-0.045em] tabular-nums">
              {gauge}
              <span className="ml-1 text-[0.28em] font-normal tracking-[0.04em]">
                G
              </span>
            </span>
            <span className="mt-4 block text-[clamp(22px,2.2vw,30px)] font-normal leading-tight tracking-[0.02em]">
              {rest}
              {character ? (
                <span className="ml-3 text-[0.6em] tracking-[0.08em] text-[var(--color-navy)]">
                  {character}
                </span>
              ) : null}
            </span>
          </>
        ) : (
          <span className="type-h2 block">{displayName}</span>
        )}
      </h1>

      <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[var(--color-ink)]">
        <span className="font-en text-[18px] tracking-[0.04em] tabular-nums">
          {formatPrice(price)}
        </span>
        <ApproxPrice amount={price} className="text-[15px] tracking-[0.02em]" />
        <span className="type-fine">{copy.taxIncluded}</span>
      </p>

      {locale === "en" ? (
        <div className="mt-3 space-y-1">
          <p className="type-caption">
            {getCurrencyCopy(locale).chargedInYen}
          </p>
          <p className="type-caption text-[var(--color-ink)]">
            {SHIPS_WITHIN_JAPAN_ONLY}
          </p>
          <p className="type-caption flex items-center gap-3">
            <span>{getCurrencyCopy(locale).estimatesIn}</span>
            <CurrencySwitch />
          </p>
        </div>
      ) : null}

      {description ? (
        <p className="type-body mt-6 line-clamp-4 text-[var(--color-ink-soft)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
