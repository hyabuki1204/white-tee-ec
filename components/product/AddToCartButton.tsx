"use client";

import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  disabled?: boolean;
  onAdd: () => void;
  label?: string;
  href?: string;
};

export function AddToCartButton({
  disabled = false,
  onAdd,
  label = SITE_UI_COPY.product.addToBag,
  href,
}: AddToCartButtonProps) {
  const className = cn(
    "block w-full min-h-12 py-4 text-center text-[12px] uppercase tracking-[0.18em] transition-opacity duration-500 md:min-h-0 md:py-3 md:text-[11px] md:tracking-[0.2em]",
    disabled
      ? "cursor-not-allowed text-neutral-300"
      : "text-neutral-800 hover:opacity-50",
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
