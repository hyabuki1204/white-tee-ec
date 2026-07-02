import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-6 sm:mb-8", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-light tracking-[0.06em] text-neutral-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="text-neutral-400">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-opacity duration-300 hover:opacity-60"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-neutral-600" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
