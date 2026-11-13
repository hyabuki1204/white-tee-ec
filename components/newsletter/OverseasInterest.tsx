"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  NewsletterFormFooter,
  NewsletterHoneypot,
} from "@/components/newsletter/NewsletterFormParts";
import {
  getNewsletterCopy,
  useNewsletterSubscribe,
} from "@/lib/newsletter/use-newsletter-subscribe";
import { getOverseasInterestCopy } from "@/lib/store-ui/info-pages";
import { cn } from "@/lib/utils";

type OverseasInterestProps = {
  className?: string;
};

/**
 * English pages only. Overseas visitors cannot order (delivery is within
 * Japan), so this offers the one existing way to hear from the store: the
 * newsletter. It is the same form and the same endpoint as the footer
 * sign-up; nothing new is collected or stored.
 */
export function OverseasInterest({ className }: OverseasInterestProps) {
  const locale = useLocale();
  const copy = getOverseasInterestCopy(locale);
  const newsletterCopy = getNewsletterCopy(locale);
  const form = useNewsletterSubscribe("footer", locale);

  if (locale !== "en") return null;

  return (
    <section
      aria-labelledby="overseas-interest"
      className={cn(
        "border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 sm:p-8",
        className,
      )}
    >
      <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
      <h2 id="overseas-interest" className="type-h2 mt-3">
        {copy.title}
      </h2>
      <p className="type-body mt-4 max-w-[40em] text-[var(--color-ink-soft)]">
        {copy.body}
      </p>

      {form.isSuccess ? (
        <p role="status" className="type-body mt-6 text-[var(--color-ink)]">
          {copy.success}
        </p>
      ) : (
        <form onSubmit={form.handleSubmit} className="relative mt-6 max-w-md">
          <NewsletterHoneypot value={form.company} onChange={form.setCompany} />
          <div className="flex items-end gap-6">
            <label className="min-w-0 flex-1 border-b border-[var(--color-ink)] pb-2">
              <span className="sr-only">{newsletterCopy.emailLabel}</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => form.setEmail(event.target.value)}
                disabled={form.isSubmitting}
                placeholder={newsletterCopy.emailLabel}
                className="type-body w-full bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
              />
            </label>
            <button
              type="submit"
              disabled={form.isSubmitting}
              aria-busy={form.isSubmitting}
              className="type-label shrink-0 pb-2 text-[var(--color-ink)] transition-[text-decoration-color] duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:underline disabled:cursor-wait disabled:opacity-60"
            >
              {form.isSubmitting
                ? newsletterCopy.submitting
                : newsletterCopy.submit}
            </button>
          </div>
          <NewsletterFormFooter error={form.error} className="mt-3" />
        </form>
      )}
    </section>
  );
}
