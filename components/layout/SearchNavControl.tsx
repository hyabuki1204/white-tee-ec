"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type SearchNavControlProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
  className?: string;
};

export function SearchNavControl({
  products,
  fabricNameBySlug,
  className,
}: SearchNavControlProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const copy = GRAPHPAPER_STORE_COPY.nav;

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return products
      .filter((product) => {
        const fabricName = product.fabricSlug
          ? fabricNameBySlug[product.fabricSlug]
          : null;
        const displayName = getGraphpaperDisplayName(product, fabricName);
        return (
          product.name.toLowerCase().includes(trimmed) ||
          displayName.toLowerCase().includes(trimmed) ||
          (fabricName?.toLowerCase().includes(trimmed) ?? false)
        );
      })
      .slice(0, 8);
  }, [fabricNameBySlug, products, query]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "type-label inline-flex min-h-11 items-center text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60",
          className,
        )}
      >
        {copy.search}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[var(--color-bg)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        {open ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 py-10 md:px-8"
          >
            <div className="flex items-center justify-between gap-6">
              <h2
                id={titleId}
                className="type-label"
              >
                {copy.search}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="type-label text-[var(--color-ink)] transition-opacity hover:opacity-60"
              >
                Close
              </button>
            </div>

            <label className="mt-10 block border-b border-[var(--color-hairline)] pb-3">
              <span className="sr-only">Search products</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Product or fabric"
                className="w-full bg-transparent text-[20px] font-normal tracking-[0.02em] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
              />
            </label>

            <ul className="mt-8 flex-1 space-y-0 overflow-y-auto">
              {results.map((product) => {
                const fabricName = product.fabricSlug
                  ? fabricNameBySlug[product.fabricSlug]
                  : null;
                const displayName = getGraphpaperDisplayName(
                  product,
                  fabricName,
                );

                return (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 border-b border-[var(--color-hairline)] py-4 transition-opacity hover:opacity-60"
                    >
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[var(--color-bg-warm)]">
                        <Image
                          src={product.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-normal tracking-[0.02em] text-[var(--color-ink)]">
                          {displayName}
                        </span>
                        <span className="mt-1 block text-[12px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)]">
                          {formatPrice(product.price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}

              {query.trim() && results.length === 0 ? (
                <li className="py-8 text-[14px] font-normal tracking-[0.02em] text-[var(--color-ink-soft)]">
                  No matching pieces.
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
