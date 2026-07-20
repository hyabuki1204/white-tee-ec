import { formatPrice } from "@/lib/utils/format-price";
import type { CheckoutOrderSummary } from "@/lib/checkout/session-summary";

type CheckoutOrderSummaryProps = {
  summary: CheckoutOrderSummary;
};

export function CheckoutOrderSummaryDisplay({
  summary,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="mx-auto mt-10 max-w-sm space-y-4 text-left">
      <ul className="space-y-3 border-t border-neutral-200/70 pt-6">
        {summary.lineItems.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="flex justify-between gap-4 text-[12px] font-normal tracking-[0.04em] text-neutral-600"
          >
            <span className="min-w-0 flex-1 leading-[1.7]">
              {item.name}
              {item.quantity > 1 ? ` × ${item.quantity}` : ""}
            </span>
            <span className="shrink-0 text-neutral-600">
              {formatPrice(item.amount)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1.5 border-t border-neutral-200/70 pt-4 text-[12px] font-normal tracking-[0.04em] text-neutral-600">
        {summary.shipping > 0 ? (
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{formatPrice(summary.shipping)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between text-neutral-700">
          <dt>Total</dt>
          <dd>{formatPrice(summary.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
