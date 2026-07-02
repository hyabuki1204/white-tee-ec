"use client";

import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

type CartOrderNotesProps = {
  value: string;
  onChange: (value: string) => void;
};

const copy = GRAPHPAPER_STORE_COPY.cart;
const MAX_LENGTH = 500;

export function CartOrderNotes({ value, onChange }: CartOrderNotesProps) {
  return (
    <div className="mt-10 border-t border-neutral-200/70 pt-8">
      <label
        htmlFor="cart-order-notes"
        className="text-[11px] font-light tracking-[0.14em] text-neutral-600"
      >
        {copy.orderNotes}
      </label>
      <textarea
        id="cart-order-notes"
        value={value}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder={copy.orderNotesPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full resize-none border border-neutral-200/80 bg-transparent px-3 py-3 text-[13px] font-light leading-[1.7] tracking-[0.02em] text-neutral-700 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400"
      />
    </div>
  );
}
