"use client";

import { SITE_UI_COPY } from "@/lib/copy/site-ui";
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
  const { product: copy } = SITE_UI_COPY;

  return (
    <div
      className={cn(
        "space-y-3 transition-opacity duration-[var(--duration-fast)] md:space-y-4",
        isDisabled && "pointer-events-none opacity-40",
      )}
    >
      <p className="text-[12px] font-normal tracking-[0.14em] text-neutral-600 md:text-[12px] md:text-neutral-600">
        {copy.qty}
      </p>
      <div className="flex items-center gap-2 md:gap-5">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={isDisabled || atMin}
          aria-label="Decrease quantity"
          className="flex h-11 w-11 items-center justify-center text-[14px] font-normal text-neutral-600 transition-opacity active:opacity-70 disabled:cursor-not-allowed disabled:opacity-30 md:h-auto md:w-auto md:text-[14px] md:text-neutral-600 md:hover:opacity-70"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="min-w-6 text-center text-[14px] font-normal tabular-nums text-neutral-700 md:min-w-4 md:text-[14px] md:text-neutral-600"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(value + 1, max))}
          disabled={isDisabled || atMax}
          aria-label="Increase quantity"
          className="flex h-11 w-11 items-center justify-center text-[14px] font-normal text-neutral-600 transition-opacity active:opacity-70 disabled:cursor-not-allowed disabled:opacity-30 md:h-auto md:w-auto md:text-[14px] md:text-neutral-600 md:hover:opacity-70"
        >
          +
        </button>
        {max > 0 && max <= 5 ? (
          <span className="ml-1 text-[12px] font-normal tracking-[0.04em] text-neutral-600 md:ml-0 md:text-[12px] md:text-neutral-600">
            {copy.qtyLeft(max)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
