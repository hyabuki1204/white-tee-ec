"use client";

import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import { useCartStore } from "@/lib/cart/store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";

type CartNavLinkProps = {
  onNavigate?: () => void;
  className?: string;
};

export function CartNavLink({ onNavigate, className }: CartNavLinkProps) {
  const mounted = useHydrated();
  const count = useCartStore((state) => state.getItemCount());
  const { openDrawer } = useCartDrawer();
  const copy = getStoreCopy(useLocale()).nav;

  const displayCount = mounted ? count : 0;

  return (
    <button
      type="button"
      onClick={() => {
        openDrawer();
        onNavigate?.();
      }}
      className={cn(
        "type-label inline-flex min-h-11 items-center text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60",
        className,
      )}
      aria-label={`${copy.bag}, ${displayCount} ${displayCount === 1 ? "item" : "items"}`}
    >
      {copy.bag} ({displayCount})
    </button>
  );
}
