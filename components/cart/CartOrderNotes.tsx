"use client";

import { useId } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";

type CartOrderNotesProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const MAX_LENGTH = 500;

export function CartOrderNotes({ value, onChange, className }: CartOrderNotesProps) {
  const copy = getStoreCopy(useLocale()).cart;
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="type-caption !text-[var(--color-ink)]">
        {copy.orderNotes}
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder={copy.orderNotesPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        className="type-body mt-2 block w-full resize-none border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none transition-colors duration-[var(--duration-quiet)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-navy)]"
      />
    </div>
  );
}
