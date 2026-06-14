"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

type CartNavLinkProps = {
  onNavigate?: () => void;
  className?: string;
};

export function CartNavLink({ onNavigate, className }: CartNavLinkProps) {
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBadge = mounted && count > 0;

  return (
    <Link
      href="/cart"
      onClick={onNavigate}
      className={cn(
        "relative inline-block text-[13px] font-light tracking-wide text-neutral-600 transition-colors hover:text-neutral-900 md:text-sm",
        className,
      )}
      aria-label={showBadge ? `Cart, ${count} items` : "Cart"}
    >
      Cart
      {showBadge ? (
        <span
          aria-hidden
          className="absolute -right-2.5 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-neutral-300/80 bg-background px-0.5 text-[9px] font-light tabular-nums leading-none text-neutral-500"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
