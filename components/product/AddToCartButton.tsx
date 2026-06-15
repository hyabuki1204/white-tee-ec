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
    "text-center uppercase transition-opacity duration-500",
    compact
      ? "shrink-0 px-4 py-2.5 text-[10px] tracking-[0.14em] underline-offset-4"
      : "block w-full min-h-12 py-4 text-[12px] tracking-[0.18em] md:min-h-0 md:py-3 md:text-[11px] md:tracking-[0.2em]",
    disabled
      ? "cursor-not-allowed text-neutral-300"
      : cn(
          "text-neutral-800 hover:opacity-50",
          !compact && "border-b border-neutral-300/80 pb-4 md:border-neutral-200/90",
        ),
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
