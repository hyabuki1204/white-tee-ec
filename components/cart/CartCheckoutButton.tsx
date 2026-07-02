"use client";

import { cn } from "@/lib/utils";

type CartCheckoutButtonProps = {
  label: string;
  disabled: boolean;
  isLoading: boolean;
  loadingLabel: string;
  onClick: () => void;
  className?: string;
  prominent?: boolean;
};

export function CartCheckoutButton({
  label,
  disabled,
  isLoading,
  loadingLabel,
  onClick,
  className,
  prominent = false,
}: CartCheckoutButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-12 w-full py-4 text-[14px] tracking-[0.16em] transition-opacity active:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-400 md:min-h-0 md:text-[13px] md:tracking-[0.2em]",
        prominent
          ? "border border-neutral-300 bg-neutral-900 text-white disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
          : "text-neutral-800 md:text-neutral-900 md:hover:opacity-60",
        className,
      )}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
