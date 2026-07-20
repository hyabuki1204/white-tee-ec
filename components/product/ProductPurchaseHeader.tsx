import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";

type ProductPurchaseHeaderProps = {
  displayName: string;
  price: number;
  description: string;
  className?: string;
};

/** Server-rendered PDP title, price, and description. */
export function ProductPurchaseHeader({
  displayName,
  price,
  description,
  className,
}: ProductPurchaseHeaderProps) {
  return (
    <header className={className}>
      <nav aria-label="Breadcrumb" className="type-fine font-en">
        <Link
          href="/products"
          className="transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
        >
          PRODUCTS
        </Link>
        <span aria-hidden className="mx-1.5">
          /
        </span>
        <span>{displayName}</span>
      </nav>

      <h1 className={cn("type-h2", "mt-5")}>{displayName}</h1>

      <p className="type-body mt-2 flex items-baseline gap-2 text-[var(--color-ink)]">
        <span>{formatPrice(price)}</span>
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
