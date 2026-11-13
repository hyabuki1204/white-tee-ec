"use client";

import { Link } from "@/components/i18n/Link";
import { useId } from "react";
import { NewsletterHoneypot } from "@/components/newsletter/NewsletterFormParts";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getRestockCopy } from "@/lib/restock/copy";
import { useRestockRequest } from "@/lib/restock/use-restock-request";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";

type RestockFormProps = {
  productId: string;
  size: ProductSize;
  /** Tighter variant for the fixed mobile purchase bar. */
  compact?: boolean;
  /** Hide the "{size}は在庫切れです。" line when the context already says it. */
  hideHeading?: boolean;
  className?: string;
};

/**
 * Inline back-in-stock request: email + one button.
 * Takes the place of the add-to-bag button when the chosen size has no stock.
 * Mount with key={`${productId}-${size}`}.
 */
export function RestockForm({
  productId,
  size,
  compact = false,
  hideHeading = false,
  className,
}: RestockFormProps) {
  const locale = useLocale();
  const RESTOCK_COPY = getRestockCopy(locale);
  const inputId = useId();
  const {
    email,
    setEmail,
    company,
    setCompany,
    error,
    isSubmitting,
    isSuccess,
    handleSubmit,
  } = useRestockRequest(productId, size, locale);

  if (isSuccess) {
    return (
      <p
        role="status"
        className={cn(
          "type-body border border-[var(--color-navy)] px-4 text-[var(--color-ink)]",
          compact ? "py-2.5" : "py-4",
          className,
        )}
      >
        {RESTOCK_COPY.success(size)}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      {hideHeading ? null : (
        <p
          className={cn(
            "type-body text-[var(--color-ink)]",
            compact ? "mb-2" : "mb-3",
          )}
        >
          {RESTOCK_COPY.heading(size)}
        </p>
      )}

      <NewsletterHoneypot value={company} onChange={setCompany} />

      <div className="flex">
        <label htmlFor={inputId} className="sr-only">
          {RESTOCK_COPY.emailLabel}
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={RESTOCK_COPY.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${inputId}-note`}
          className={cn(
            // 16px keeps iOS Safari from zooming the page on focus.
            "min-w-0 flex-1 border border-r-0 border-[var(--color-navy)] bg-[var(--color-bg)] px-3 text-[16px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus-visible:outline-offset-[-2px] md:text-[14px]",
            compact ? "h-11" : "h-12",
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "shrink-0 border border-[var(--color-navy)] bg-[var(--color-navy)] text-[13px] tracking-[0.06em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] disabled:cursor-wait disabled:opacity-60",
            compact ? "h-11 px-3" : "h-12 px-4",
          )}
        >
          {isSubmitting ? RESTOCK_COPY.submitting : RESTOCK_COPY.submit}
        </button>
      </div>

      <p role="alert" className="type-caption text-[var(--color-ink)]">
        {error ? <span className="mt-2 block">{error}</span> : null}
      </p>

      <p id={`${inputId}-note`} className="type-fine mt-2">
        {RESTOCK_COPY.notice}
        <Link
          href="/privacy"
          className="ml-1 underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
        >
          {RESTOCK_COPY.privacyLink}
        </Link>
      </p>
    </form>
  );
}
