"use client";

import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import {
  NewsletterFormFooter,
  NewsletterHoneypot,
} from "@/components/newsletter/NewsletterFormParts";
import {
  NEWSLETTER_COPY,
  useNewsletterSubscribe,
} from "@/lib/newsletter/use-newsletter-subscribe";
import { STORE_TYPO } from "@/lib/store-ui/typography";
import { cn } from "@/lib/utils";

export function HomeNewsletter() {
  const form = useNewsletterSubscribe("home");

  return (
    <section
      aria-label="Newsletter"
      className="pb-[var(--space-6)] md:pb-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="border-t border-[var(--color-hairline)] pt-[var(--space-6)] md:pt-[var(--space-7)]" />
        <HomeSectionHeading label="NEWSLETTER" title="新しい白の知らせを。" />

        {form.isSuccess ? (
          <p
            role="status"
            className={cn(STORE_TYPO.body, "mt-[var(--space-4)]")}
          >
            {NEWSLETTER_COPY.success}
          </p>
        ) : (
          <form
            onSubmit={form.handleSubmit}
            className="relative mt-[var(--space-4)] max-w-xl"
          >
            <NewsletterHoneypot
              value={form.company}
              onChange={form.setCompany}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1 border-b border-[var(--color-hairline)] pb-2">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => form.setEmail(event.target.value)}
                  disabled={form.isSubmitting}
                  placeholder="Email address"
                  className="type-body w-full bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
                />
              </label>
              <button
                type="submit"
                disabled={form.isSubmitting}
                aria-busy={form.isSubmitting}
                className="shrink-0 border border-[var(--color-ink)] px-10 py-4 type-label text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[var(--color-ink)]"
              >
                {form.isSubmitting
                  ? NEWSLETTER_COPY.submitting
                  : NEWSLETTER_COPY.submit}
              </button>
            </div>
            <NewsletterFormFooter error={form.error} className="mt-3" />
          </form>
        )}
      </div>
    </section>
  );
}
