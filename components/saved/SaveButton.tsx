"use client";

import Link from "next/link";
import { SAVED_COPY } from "@/lib/saved/copy";
import { isSaved, useSavedStore } from "@/lib/saved/store";
import { useHydrated } from "@/lib/saved/use-hydrated";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";

type SaveButtonProps = {
  productId: string;
  /** Gauge-first product name, for the accessible label. */
  productName: string;
  /** Stored with the piece when it is saved. */
  size?: ProductSize | null;
  className?: string;
};

function useSavedToggle(productId: string, size?: ProductSize | null) {
  const hydrated = useHydrated();
  const saved = useSavedStore((state) => isSaved(state.items, productId));
  const toggle = useSavedStore((state) => state.toggle);

  return {
    // The server cannot know, so the first paint is always "not saved".
    saved: hydrated && saved,
    onToggle: () => toggle(productId, size ?? null),
  };
}

/**
 * Text control on a product card image (top right).
 * Pointer devices: appears on card hover or keyboard focus, and stays
 * visible once saved. Touch devices: always visible.
 */
export function SaveCardButton({
  productId,
  productName,
  className,
}: SaveButtonProps) {
  const { saved, onToggle } = useSavedToggle(productId);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={SAVED_COPY.saveAria(productName)}
      className={cn(
        "group/save absolute right-0 top-0 z-10 flex min-h-11 min-w-11 items-start justify-end p-2 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
        !saved &&
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
        className,
      )}
    >
      <span
        className={cn(
          "font-en flex h-7 items-center border px-2.5 text-[11px] font-medium leading-none tracking-[0.1em] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
          saved
            ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
            : "border-transparent bg-[var(--color-bg)] text-[var(--color-ink)] group-hover/save:border-[var(--color-navy)] group-hover/save:text-[var(--color-navy)]",
        )}
      >
        {saved ? SAVED_COPY.saved : SAVED_COPY.save}
      </span>
    </button>
  );
}

/** Secondary button on the product page, under add-to-bag. */
export function SaveInlineButton({
  productId,
  productName,
  size,
  className,
}: SaveButtonProps) {
  const { saved, onToggle } = useSavedToggle(productId, size);

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={saved}
        aria-label={SAVED_COPY.saveAria(productName)}
        className={cn(
          "flex h-12 flex-1 items-center justify-center border border-[var(--color-navy)] text-[13px] tracking-[0.1em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
          saved
            ? "bg-[var(--color-navy)] text-white hover:bg-[var(--color-ink)] hover:border-[var(--color-ink)]"
            : "text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white",
        )}
      >
        {saved ? SAVED_COPY.saved : SAVED_COPY.save}
      </button>
      {saved ? (
        <Link
          href="/saved"
          className="type-caption shrink-0 underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60"
        >
          {SAVED_COPY.viewSaved}
        </Link>
      ) : null}
    </div>
  );
}
