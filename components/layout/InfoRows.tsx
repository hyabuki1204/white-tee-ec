import Link from "next/link";
import { textLinkClass } from "@/lib/store-ui/ui-classes";
import { cn } from "@/lib/utils";

export type InfoRow = {
  title: string;
  body: React.ReactNode;
  href?: string;
  linkLabel?: string;
};

type InfoRowsProps = {
  rows: readonly InfoRow[];
  /** Show "01", "02" … beside each title. */
  numbered?: boolean;
  /** Heading level of the row titles. */
  as?: "h2" | "h3";
  className?: string;
};

/**
 * Readable policy / guide content on the 12-column grid: title on the left,
 * text on the right, a hairline between rows.
 */
export function InfoRows({
  rows,
  numbered = false,
  as: Heading = "h2",
  className,
}: InfoRowsProps) {
  return (
    <div className={cn("border-t border-[var(--color-ink)]", className)}>
      {rows.map((row, index) => (
        <section
          key={row.title}
          className="grid gap-3 border-b border-[var(--color-hairline)] py-7 md:grid-cols-12 md:gap-0 md:py-9"
        >
          <div className="md:col-span-4">
            {numbered ? (
              <p className="type-label mb-2 tabular-nums !text-[var(--color-navy)]">
                {String(index + 1).padStart(2, "0")}
              </p>
            ) : null}
            <Heading className="text-[16px] font-bold leading-[1.7] tracking-[0.08em] text-[var(--color-ink)]">
              {row.title}
            </Heading>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <div className="type-body max-w-[40em] text-[var(--color-ink)]">
              {row.body}
            </div>
            {row.href && row.linkLabel ? (
              <Link href={row.href} className={`${textLinkClass} mt-4 inline-block`}>
                {row.linkLabel}
              </Link>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
