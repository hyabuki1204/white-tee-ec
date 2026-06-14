"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BagIcon } from "@/components/icons/BagIcon";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

type CartNavLinkProps = {
  onNavigate?: () => void;
  className?: string;
  /** Icon-only for compact header slots (mobile top bar). */
  showLabel?: boolean;
};

export function CartNavLink({
  onNavigate,
  className,
  showLabel = true,
}: CartNavLinkProps) {
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((state) => state.getItemCount());
  const { cart: copy } = SITE_UI_COPY;

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBadge = mounted && count > 0;
  const badgeLabel = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/cart"
      onClick={onNavigate}
      className={cn(
        "relative inline-flex items-center gap-2 text-[13px] font-light tracking-wide text-neutral-600 transition-colors hover:text-neutral-900 md:text-sm",
        className,
      )}
      aria-label={
        showBadge ? `${copy.title}, ${count} items` : copy.title
      }
    >
      <span className="relative flex shrink-0 items-center justify-center">
        <BagIcon className="h-[18px] w-[18px] md:h-4 md:w-4" />
        {showBadge ? (
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-neutral-300/80 bg-background px-0.5 text-[9px] font-medium tabular-nums leading-none text-neutral-700"
          >
            {badgeLabel}
          </span>
        ) : null}
      </span>
      {showLabel ? <span>{copy.title}</span> : null}
    </Link>
  );
}
