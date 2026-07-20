"use client";

import { useState, type FormEvent } from "react";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";

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
      className="border-t border-[var(--color-hairline)] py-[var(--space-6)] md:py-[var(--space-7)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <HomeSectionHeading
          label="NEWSLETTER"
          title="新しい白の知らせを。"
        />

        {submitted ? (
          <p className="mt-[var(--space-4)] text-[14px] font-normal leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--color-ink-soft)]">
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
                className="w-full bg-transparent text-[14px] font-normal tracking-[0.02em] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
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
