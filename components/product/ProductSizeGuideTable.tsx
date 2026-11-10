"use client";

import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";
import type { SizeGuideMeasurement } from "@/types";

type ProductSizeGuideTableProps = {
  rows: SizeGuideMeasurement[];
};

/** Measurement table anchored by #size-guide. */
export function ProductSizeGuideTable({ rows }: ProductSizeGuideTableProps) {
  const { product: copy } = SITE_UI_COPY;
  const { selectedSize } = useProductPurchase();

  if (rows.length === 0) return null;

  return (
    <section id="size-guide" aria-label={copy.sizeGuide} className="mt-10">
      <h2 className="text-[11px] font-normal tracking-[0.12em] text-[var(--color-ink-soft)]">
        {copy.sizeGuide}
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
                </td>
                <td className="py-2.5 pr-3 text-[14px] text-[var(--color-ink)]">
                  {row.shoulder}
                </td>
                <td className="py-2.5 pr-3 text-[14px] text-[var(--color-ink)]">
                  {row.chest}
                </td>
                <td className="py-2.5 text-[14px] text-[var(--color-ink)]">
                  {row.sleeve}
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
