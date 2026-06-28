import Link from "next/link";
import { CHECKOUT_TRUST_COPY } from "@/lib/store-ui/checkout-trust";

type CartCheckoutTrustProps = {
  compact?: boolean;
};

export function CartCheckoutTrust({ compact = false }: CartCheckoutTrustProps) {
  const items = compact
    ? CHECKOUT_TRUST_COPY.items.filter((item) =>
        ["Production", "Returns"].includes(item.label),
      )
    : CHECKOUT_TRUST_COPY.items;

  return (
    <div
      className={
        compact
          ? "space-y-2 border-t border-neutral-200/50 pt-3"
          : "space-y-4 border-t border-neutral-200/50 pt-6"
      }
    >
      {!compact ? (
        <p className="text-[10px] font-light tracking-[0.14em] text-neutral-400">
          {CHECKOUT_TRUST_COPY.title}
        </p>
      ) : null}

      <ul className={compact ? "space-y-2" : "space-y-4"}>
        {items.map((item) => (
          <li key={item.label} className="space-y-1">
            {!compact ? (
              <p className="text-[10px] font-light tracking-[0.1em] text-neutral-400">
                {item.label}
              </p>
            ) : null}
            <p className="text-[10px] font-light leading-[1.85] tracking-[0.04em] text-neutral-500">
              {compact ? (
                <>
                  <span className="text-neutral-400">{item.label}. </span>
                  {item.line}
                </>
              ) : (
                item.line
              )}
            </p>
          </li>
        ))}
      </ul>

      {!compact ? (
        <>
          <p className="text-[10px] font-light leading-[1.8] tracking-[0.04em] text-neutral-300">
            {CHECKOUT_TRUST_COPY.helperJa}
          </p>
          <Link
            href="/shipping"
            className="inline-block text-[10px] font-light tracking-[0.08em] text-neutral-400 transition-opacity hover:opacity-60"
          >
            Shipping & Returns
          </Link>
        </>
      ) : null}
    </div>
  );
}
