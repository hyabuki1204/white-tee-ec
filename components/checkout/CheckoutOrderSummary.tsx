import { formatPrice } from "@/lib/utils/format-price";
import type { CheckoutOrderSummary } from "@/lib/checkout/session-summary";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

type CheckoutOrderSummaryProps = {
  summary: CheckoutOrderSummary;
};

const { cart: copy } = GRAPHPAPER_STORE_COPY;
const priceClass =
  "shrink-0 font-en text-[15px] tracking-[0.02em] tabular-nums text-[var(--color-ink)]";

export function CheckoutOrderSummaryDisplay({
  summary,
}: CheckoutOrderSummaryProps) {
  return (
    <div>
      <ul className="divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
        {summary.lineItems.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="flex items-baseline justify-between gap-4 py-4"
          >
            <span className="type-body min-w-0 flex-1 text-[var(--color-ink)]">
              {item.name}
              {item.quantity > 1 ? (
                <span className="ml-2 font-en tabular-nums text-[var(--color-ink-soft)]">
                  × {item.quantity}
                </span>
              ) : null}
            </span>
            <span className={priceClass}>{formatPrice(item.amount)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="type-body text-[var(--color-ink-soft)]">
            {copy.shipping}
          </dt>
          <dd className={priceClass}>
            {summary.shipping > 0 ? (
              formatPrice(summary.shipping)
            ) : (
              <span className="font-[family-name:var(--font-sans-jp)] text-[14px]">
                {copy.shippingFree}
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-[var(--color-ink)] pt-4">
          <dt className="text-[14px] font-bold tracking-[0.08em] text-[var(--color-ink)]">
            {copy.total}
            <span className="type-caption ml-2 font-normal">
              {copy.taxIncluded}
            </span>
          </dt>
          <dd className="font-en text-[26px] leading-none tabular-nums text-[var(--color-ink)]">
            {formatPrice(summary.total)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
