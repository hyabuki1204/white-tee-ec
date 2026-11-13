import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";

type ProductPurchaseHeaderProps = {
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
  displayName,
  price,
  description,
  gauge,
  character,
  className,
}: ProductPurchaseHeaderProps) {
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
          Collection
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

      <p className="mt-4 flex items-baseline gap-2 text-[var(--color-ink)]">
        <span className="font-en text-[18px] tracking-[0.04em] tabular-nums">
          {formatPrice(price)}
        </span>
        <span className="type-fine">(税込)</span>
      </p>

      {description ? (
        <p className="type-body mt-6 line-clamp-4 text-[var(--color-ink-soft)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
