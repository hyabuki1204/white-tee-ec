"use client";

import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  disabled?: boolean;
  onAdd: () => void;
  label?: string;
  href?: string;
  /** Tighter layout for fixed mobile purchase bar. */
  compact?: boolean;
};

export function AddToCartButton({
  disabled = false,
  onAdd,
  label = SITE_UI_COPY.product.addToBag,
  href,
  compact = false,
}: AddToCartButtonProps) {
  const className = cn(
    "inline-flex items-center justify-center text-center uppercase transition-colors duration-[var(--duration-fast)]",
    compact
      ? "shrink-0 border px-4 py-2.5 text-[11px] tracking-[0.14em]"
      : "block w-full min-h-[3rem] border px-6 py-3.5 text-[12px] tracking-[0.18em] md:text-[14px] md:tracking-[0.2em]",
    disabled
      ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400"
      : "border-neutral-800 bg-transparent text-neutral-900 hover:bg-neutral-900 hover:text-white",
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onAdd}
      className={className}
    >
      {label}
    </button>
  );
}
