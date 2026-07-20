"use client";

import { useState, type FormEvent } from "react";

/** Minimal email + SUBSCRIBE row for the site footer. */
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="type-caption mt-4">登録を受け付けました。</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex max-w-md items-end gap-6"
    >
      <label className="min-w-0 flex-1 border-b border-[var(--color-ink)] pb-2">
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
        className="type-label shrink-0 pb-2 text-[var(--color-ink)] transition-[text-decoration-color] duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:underline"
      >
        SUBSCRIBE
      </button>
    </form>
  );
}
