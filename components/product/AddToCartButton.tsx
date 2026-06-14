"use client";

import Link from "next/link";
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
  label = "Add to Bag",
  href,
}: AddToCartButtonProps) {
  const className = cn(
    "block w-full py-4 text-center text-[11px] uppercase tracking-[0.22em] transition-colors duration-500",
    disabled
      ? "cursor-not-allowed text-neutral-300"
      : "text-neutral-900 hover:bg-neutral-900/[0.04]",
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
