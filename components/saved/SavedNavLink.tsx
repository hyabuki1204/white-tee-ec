"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SAVED_COPY } from "@/lib/saved/copy";
import { useSavedStore } from "@/lib/saved/store";
import { useHydrated } from "@/lib/saved/use-hydrated";
import { cn } from "@/lib/utils";

type SavedNavLinkProps = {
  onNavigate?: () => void;
  className?: string;
};

/** "Saved (n)" — always rendered, including at zero, so the header never shifts. */
export function SavedNavLink({ onNavigate, className }: SavedNavLinkProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useSavedStore((state) => state.items.length);
  const displayCount = hydrated ? count : 0;
  const active = pathname === "/saved";

  return (
    <Link
      href="/saved"
      onClick={onNavigate}
      aria-label={`${SAVED_COPY.nav}, ${displayCount} items`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "type-label inline-flex min-h-11 items-center tabular-nums text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60",
        active &&
          "underline decoration-[var(--color-ink)] underline-offset-[6px]",
        className,
      )}
    >
      {SAVED_COPY.nav} ({displayCount})
    </Link>
  );
}
