"use client";

import { useState, type FormEvent } from "react";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { STORE_TYPO } from "@/lib/store-ui/typography";
import { cn } from "@/lib/utils";

export function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section
      aria-label="Newsletter"
      className="pb-[var(--space-6)] md:pb-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="border-t border-[var(--color-hairline)] pt-[var(--space-6)] md:pt-[var(--space-7)]" />
        <HomeSectionHeading
          label="NEWSLETTER"
          title="新しい白の知らせを。"
        />

        {submitted ? (
          <p className={cn(STORE_TYPO.body, "mt-[var(--space-4)]")}>
            登録を受け付けました。
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-[var(--space-4)] flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end"
          >
            <label className="min-w-0 flex-1 border-b border-[var(--color-hairline)] pb-2">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="type-body w-full bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
              />
            </label>
            <button
              type="submit"
              className="shrink-0 border border-[var(--color-ink)] px-10 py-4 type-label text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]"
            >
              SUBSCRIBE
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
