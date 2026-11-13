import { cn } from "@/lib/utils";

type PageHeaderProps = {
  /** Short English label in the navy accent, e.g. "Journal". */
  label: string;
  /** Japanese page title, set in the display style. */
  title: React.ReactNode;
  /** One or two sentences under the title. */
  lead?: React.ReactNode;
  /** Right-hand slot on wide screens (count, link, small control). */
  aside?: React.ReactNode;
  className?: string;
};

/**
 * The standard opening of a storefront page: navy English label, bold
 * Japanese title, optional lead. Left-aligned, on the white surface, closed
 * by a hairline — the same block the collection page opens with.
 */
export function PageHeader({ label, title, lead, aside, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-[var(--color-hairline)] bg-[var(--color-surface)]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-8 md:py-16 lg:px-12">
        <div className="max-w-2xl">
          <p className="type-label !text-[var(--color-navy)]">{label}</p>
          <h1 className="type-display mt-3">{title}</h1>
          {lead ? (
            <p className="type-body mt-5 text-[var(--color-ink-soft)]">{lead}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}
