"use client";

import { useEffect, useState } from "react";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

type CartNavLinkProps = {
  onNavigate?: () => void;
  className?: string;
};

export function CartNavLink({ onNavigate, className }: CartNavLinkProps) {
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((state) => state.getItemCount());
  const { openDrawer } = useCartDrawer();
  const copy = GRAPHPAPER_STORE_COPY.nav;

  useEffect(() => {
    setMounted(true);
  }, []);

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
      aria-label={`${copy.bag}, ${displayCount} items`}
    >
      {copy.bag} ({displayCount})
    </button>
  );
}
