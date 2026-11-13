import { Link } from "@/components/i18n/Link";
import { getGaugeLadder, getGaugeNumber } from "@/lib/fabric/gauge";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";
import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const getCopy = defineCopy(
  { gauge: "ゲージ", silhouette: "シルエット", label: "ゲージとシルエット" },
  { gauge: "Gauge", silhouette: "Silhouette", label: "Gauge and silhouette" },
);

type ProductLadderNavProps = {
  locale: Locale;
  product: Product;
};

const cellClass =
  "flex min-h-11 flex-1 items-center justify-center border px-3 font-en text-[14px] tracking-[0.04em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]";

function cellState(active: boolean) {
  return active
    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
    : "border-[var(--color-hairline)] text-[var(--color-ink)] hover:border-[var(--color-ink)]";
}

/**
 * A piece is one cell in a gauge × silhouette grid. These two rows let the
 * customer move along either axis without going back to the listing.
 */
export function ProductLadderNav({ locale, product }: ProductLadderNavProps) {
  const copy = getCopy(locale);

  if (!getGaugeNumber(product.fabricSlug)) return null;

  const find = (fabricSlug: string | null, fitType: Product["fitType"]) =>
    PRODUCT_CATALOG.find(
      (entry) => entry.fabricSlug === fabricSlug && entry.fitType === fitType,
    );

  const gauges = getGaugeLadder(locale).map((item) => ({
    label: `${item.gauge}G`,
    entry: find(item.fabricSlug, product.fitType),
    active: item.fabricSlug === product.fabricSlug,
  })).filter((item) => item.entry);

  const silhouettes = (
    [
      ["regular", "Regular"],
      ["boxy", "Box"],
    ] as const
  )
    .map(([fitType, label]) => ({
      label,
      entry: find(product.fabricSlug, fitType),
      active: fitType === product.fitType,
    }))
    .filter((item) => item.entry);

  const rows = [
    { title: copy.gauge, items: gauges },
    { title: copy.silhouette, items: silhouettes },
  ].filter((row) => row.items.length > 1);

  if (rows.length === 0) return null;

  return (
    <nav aria-label={copy.label} className="mt-8 space-y-5">
      {rows.map((row) => (
        <div key={row.title}>
          <p className="type-caption">{row.title}</p>
          <ul className="mt-2 flex gap-2">
            {row.items.map((item) => (
              <li key={item.label} className="flex flex-1">
                <Link
                  href={`/products/${item.entry!.slug}`}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(cellClass, cellState(item.active))}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
