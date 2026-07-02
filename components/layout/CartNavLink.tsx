"use client";

import { useEffect, useState } from "react";
import { BagIcon } from "@/components/icons/BagIcon";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

type CartNavLinkProps = {
  onNavigate?: () => void;
  className?: string;
  showLabel?: boolean;
};

export function CartNavLink({
  onNavigate,
  className,
  showLabel = true,
}: CartNavLinkProps) {
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((state) => state.getItemCount());
  const { openDrawer } = useCartDrawer();
  const copy = GRAPHPAPER_STORE_COPY.nav;

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBadge = mounted && count > 0;
  const badgeLabel = count > 99 ? "99+" : String(count);

  return (
    <button
      type="button"
      onClick={() => {
        openDrawer();
        onNavigate?.();
      }}
      className={cn(
        "relative inline-flex items-center gap-2 text-[12px] font-light tracking-[0.14em] text-neutral-600 transition-opacity hover:opacity-60",
        className,
      )}
      aria-label={
        showBadge ? `${copy.bag}, ${count} items` : copy.bag
      }
    >
      <span className="relative flex shrink-0 items-center justify-center">
        <BagIcon className="h-[17px] w-[17px]" />
        {showBadge ? (
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-neutral-300/80 bg-background px-0.5 text-[10px] font-medium tabular-nums leading-none text-neutral-700"
          >
            {badgeLabel}
          </span>
        ) : null}
      </span>
      {showLabel ? <span>{copy.bag}</span> : null}
    </button>
  );
}
