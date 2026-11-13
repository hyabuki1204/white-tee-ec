"use client";

import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getProductCopy } from "@/lib/copy/site-ui";
import { cmToInches } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import type { SizeGuideMeasurement } from "@/types";

type ProductSizeGuideTableProps = {
  rows: SizeGuideMeasurement[];
};

/** Inches under the centimetre figure — English pages only. */
function Inches({ cm }: { cm: number }) {
  return (
    <span className="block text-[12px] text-[var(--color-ink-soft)]">
      {cmToInches(cm)}
    </span>
  );
}

/** Measurement table anchored by #size-guide. */
export function ProductSizeGuideTable({ rows }: ProductSizeGuideTableProps) {
  const locale = useLocale();
  const copy = getProductCopy(locale);
  const showInches = locale === "en";
  const { selectedSize } = useProductPurchase();

  if (rows.length === 0) return null;

  return (
    <section id="size-guide" aria-label={copy.sizeGuide} className="mt-10">
      <h2 className="text-[11px] font-normal tracking-[0.12em] text-[var(--color-ink-soft)]">
        {copy.sizeGuide}
        {showInches ? (
          <span className="ml-2 tracking-[0.04em] text-[var(--color-ink-faint)]">
            cm / in
          </span>
        ) : null}
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[18rem] w-full border-collapse text-left tabular-nums">
          <caption className="sr-only">{copy.sizeTableCaption}</caption>
          <thead>
            <tr className="border-b border-[var(--color-hairline)]">
              {copy.sizeTableHeaders.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="pb-2 pr-3 text-[12px] font-normal text-[var(--color-ink-soft)]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.size}
                aria-current={row.size === selectedSize ? "true" : undefined}
                className={cn(
                  "border-b border-[var(--color-hairline)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                  // Once a size is chosen, quiet the other rows.
                  selectedSize !== null &&
                    row.size !== selectedSize &&
                    "[&>*]:text-[var(--color-ink-faint)]",
                )}
              >
                <th
                  scope="row"
                  className="py-2.5 pr-3 text-left text-[14px] font-normal text-[var(--color-ink)]"
                >
                  {row.size}
                </th>
                <td className="py-2.5 pr-3 text-[14px] text-[var(--color-ink)]">
                  {row.length}
                  {showInches ? <Inches cm={row.length} /> : null}
                </td>
                <td className="py-2.5 pr-3 text-[14px] text-[var(--color-ink)]">
                  {row.shoulder}
                  {showInches ? <Inches cm={row.shoulder} /> : null}
                </td>
                <td className="py-2.5 pr-3 text-[14px] text-[var(--color-ink)]">
                  {row.chest}
                  {showInches ? <Inches cm={row.chest} /> : null}
                </td>
                <td className="py-2.5 text-[14px] text-[var(--color-ink)]">
                  {row.sleeve}
                  {showInches ? <Inches cm={row.sleeve} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] font-normal leading-[1.8] text-[var(--color-ink-soft)]">
        {copy.sizeTableExplainer}
      </p>
    </section>
  );
}
