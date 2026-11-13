"use client";

import {
  NewsletterFormFooter,
  NewsletterHoneypot,
} from "@/components/newsletter/NewsletterFormParts";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  getNewsletterCopy,
  useNewsletterSubscribe,
} from "@/lib/newsletter/use-newsletter-subscribe";

/** Minimal email + SUBSCRIBE row for the site footer. */
export function FooterNewsletter() {
  const locale = useLocale();
  const copy = getNewsletterCopy(locale);
  const form = useNewsletterSubscribe("footer", locale);

  if (form.isSuccess) {
    return (
      <p role="status" className="type-caption mt-4">
        {copy.success}
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="relative mt-4 max-w-md">
      <NewsletterHoneypot value={form.company} onChange={form.setCompany} />
      <div className="flex items-end gap-6">
        <label className="min-w-0 flex-1 border-b border-[var(--color-ink)] pb-2">
          <span className="sr-only">{copy.emailLabel}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => form.setEmail(event.target.value)}
            disabled={form.isSubmitting}
            placeholder={copy.emailLabel}
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
            ? copy.submitting
            : copy.submit}
        </button>
      </div>
      <NewsletterFormFooter error={form.error} className="mt-3" />
    </form>
  );
}
