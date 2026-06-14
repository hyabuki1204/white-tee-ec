"use client";

import { cn } from "@/lib/utils";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled?: boolean;
};

export function QuantitySelector({
  value,
  onChange,
  max,
  disabled = false,
}: QuantitySelectorProps) {
  const atMin = value <= 1;
  const atMax = max > 0 && value >= max;
  const isDisabled = disabled || max < 1;

  return (
    <div
      className={cn(
        "space-y-5 transition-opacity duration-300",
        isDisabled && "pointer-events-none opacity-40",
      )}
    >
      <p className="text-[10px] font-light tracking-[0.16em] text-neutral-400">
        Qty
      </p>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={isDisabled || atMin}
          aria-label="Decrease quantity"
          className="text-xs font-light text-neutral-400 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="min-w-4 text-center text-xs font-light tabular-nums text-neutral-700"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(value + 1, max))}
          disabled={isDisabled || atMax}
          aria-label="Increase quantity"
          className="text-xs font-light text-neutral-400 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
        {max > 0 && max <= 5 ? (
          <span className="text-[10px] font-light tracking-[0.04em] text-neutral-400">
            {max} available
          </span>
        ) : null}
      </div>
    </div>
  );
}
