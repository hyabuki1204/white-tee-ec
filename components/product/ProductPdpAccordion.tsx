"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type ProductPdpAccordionProps = {
  items: AccordionItem[];
};

export function ProductPdpAccordion({ items }: ProductPdpAccordionProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mt-10 border-t border-[var(--color-hairline)]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div
            key={item.id}
            className="border-b border-[var(--color-hairline)]"
          >
            <h2>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-[14px] font-normal tracking-[0.04em] text-[var(--color-ink)]"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-sans-en)] text-[14px] leading-none text-[var(--color-ink-soft)]"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h2>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-5 text-[14px] font-normal leading-[1.9] tracking-[var(--tracking-body)] text-[var(--color-ink-soft)]">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
