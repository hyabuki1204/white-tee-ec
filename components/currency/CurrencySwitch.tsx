"use client";

import { Fragment } from "react";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { CURRENCIES } from "@/lib/currency/config";
import { getCurrencyCopy } from "@/lib/currency/copy";
import { cn } from "@/lib/utils";

type CurrencySwitchProps = {
  className?: string;
};

/**
 * "USD / EUR / GBP" — small text control for the indicative currency.
 * English pages only.
 */
export function CurrencySwitch({ className }: CurrencySwitchProps) {
  const locale = useLocale();
  const { currency, setCurrency, fx } = useCurrency();
  const copy = getCurrencyCopy(locale);

  if (locale !== "en") return null;

  return (
    // A span: the control sits inside sentences ("Estimates in USD / EUR / GBP").
    <span
      role="group"
      aria-label={copy.switchLabel}
      title={copy.ratesAsOf(fx.asOf)}
      className={cn(
        "font-en inline-flex items-center text-[12px] font-medium tracking-[0.08em] tabular-nums",
        className,
      )}
    >
      {CURRENCIES.map((code, index) => {
        const active = code === currency;

        return (
          <Fragment key={code}>
            {index > 0 ? (
              <span aria-hidden className="mx-1.5 text-[var(--color-ink-faint)]">
                /
              </span>
            ) : null}
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setCurrency(code)}
              className={cn(
                "inline-flex min-h-8 items-center transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                active
                  ? "text-[var(--color-ink)] underline decoration-[var(--color-ink)] underline-offset-[5px]"
                  : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
              )}
            >
              {code}
            </button>
          </Fragment>
        );
      })}
    </span>
  );
}
