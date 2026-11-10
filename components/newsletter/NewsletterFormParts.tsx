import Link from "next/link";
import { NEWSLETTER_COPY } from "@/lib/newsletter/use-newsletter-subscribe";
import { cn } from "@/lib/utils";

/** Off-screen field for bots; hidden from people and assistive tech. */
export function NewsletterHoneypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      aria-hidden
      className="absolute -left-[9999px] h-px w-px overflow-hidden"
    >
      <label>
        Company
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

/** Error line + purpose-of-use notice shown under the form. */
export function NewsletterFormFooter({
  error,
  className,
}: {
  error: string | null;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p
        role="alert"
        className="type-caption min-h-[1.8em] text-[var(--color-ink)]"
      >
        {error}
      </p>
      <p className="type-fine">
        {NEWSLETTER_COPY.notice}
        <Link
          href="/privacy"
          className="ml-1 underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
        >
          {NEWSLETTER_COPY.privacyLink}
        </Link>
      </p>
    </div>
  );
}
