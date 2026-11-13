"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatApprox } from "@/lib/currency/format";
import { cn } from "@/lib/utils";

type ApproxPriceProps = {
  /** Amount in Japanese yen. */
  amount: number;
  className?: string;
  /** Wrap in brackets: "(approx. US$117)". */
  bracketed?: boolean;
};

/**
 * Indicative conversion shown beside a yen price — English pages only.
 * Renders nothing in Japanese, so the Japanese layout is untouched.
 */
export function ApproxPrice({
  amount,
  className,
  bracketed = true,
}: ApproxPriceProps) {
  const locale = useLocale();
  const { currency, fx } = useCurrency();

  if (locale !== "en") return null;

  const text = formatApprox(amount, currency, fx);

  return (
    <span
      className={cn(
        "font-en whitespace-nowrap tabular-nums text-[var(--color-ink-soft)]",
        className,
      )}
    >
      {bracketed ? `(${text})` : text}
    </span>
  );
}
