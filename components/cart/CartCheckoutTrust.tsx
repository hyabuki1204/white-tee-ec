"use client";

import { Link } from "@/components/i18n/Link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getCheckoutTrustCopy } from "@/lib/store-ui/checkout-trust";
import { textLinkClass } from "@/lib/store-ui/ui-classes";

const SUMMARY_ITEM_IDS: readonly string[] = ["shipping", "returns", "payment"];

/** Shipping, returns and payment terms, stated once beside the total. */
export function CartCheckoutTrust() {
  const locale = useLocale();
  const CHECKOUT_TRUST_COPY = getCheckoutTrustCopy(locale);
  const items = CHECKOUT_TRUST_COPY.items.filter((item) =>
    SUMMARY_ITEM_IDS.includes(item.id),
  );

  return (
    <div className="border-t border-[var(--color-hairline)] pt-6">
      <p className="type-caption !text-[var(--color-ink)]">
        {CHECKOUT_TRUST_COPY.title}
      </p>

      <dl className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={
              locale === "en"
                ? "grid grid-cols-[5em_1fr] gap-x-3"
                : "grid grid-cols-[3.5em_1fr] gap-x-3"
            }
          >
            <dt className="type-caption !text-[var(--color-ink)]">
              {item.label}
            </dt>
            <dd className="type-caption">{item.line}</dd>
          </div>
        ))}
      </dl>

      <Link href="/shipping" className={`${textLinkClass} mt-5 inline-block !text-[12px]`}>
        {CHECKOUT_TRUST_COPY.shippingLink}
      </Link>
    </div>
  );
}
