"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GAUGE_LADDER, getGaugeSpec } from "@/lib/fabric/gauge";
import { useHydrated } from "@/lib/hooks/use-hydrated";
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

type SearchEntry = {
  product: Product;
  /** Gauge-first name: "46G Regular Tee". */
  displayName: string;
  /** Yarn line under the name. */
  meta: string | null;
  haystack: string;
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
  const hydrated = useHydrated();
  const copy = GRAPHPAPER_STORE_COPY.nav;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const entries = useMemo<SearchEntry[]>(
    () =>
      products.map((product) => {
        const fabricName = product.fabricSlug
          ? fabricNameBySlug[product.fabricSlug]
          : null;
        const displayName = getGraphpaperDisplayName(product, fabricName);
        const spec = getGaugeSpec(product.fabricSlug);
        const silhouetteJa =
          product.fitType === "boxy" ? "ボックス" : "レギュラー";

        return {
          product,
          displayName,
          meta: spec ? `${spec.yarn}・${spec.structure}` : fabricName,
          haystack: [
            product.name,
            displayName,
            fabricName,
            silhouetteJa,
            spec ? `${spec.gauge}ゲージ ${spec.yarn} ${spec.character}` : null,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      }),
    [fabricNameBySlug, products],
  );

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? entries.filter((entry) => entry.haystack.includes(trimmed)).slice(0, 8)
    : entries.slice(0, 8);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
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

      {/* Portalled to <body> so the overlay is not trapped inside the
          stacking context of whatever holds the trigger (the mobile menu
          sits below the fixed header). */}
      {hydrated
        ? createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[60] bg-[var(--color-surface)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
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
                  className="mx-auto flex h-full w-full max-w-7xl flex-col px-6 md:px-8 lg:px-12"
                >
                  <div className="flex h-[72px] shrink-0 items-center justify-between gap-6">
                    <h2
                      id={titleId}
                      className="type-label !text-[var(--color-navy)]"
                    >
                      {copy.search}
                    </h2>
                    <button
                      type="button"
                      onClick={close}
                      className="type-label -mr-2 inline-flex min-h-11 items-center px-2 text-[var(--color-ink)] transition-opacity hover:opacity-60"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid min-h-0 flex-1 md:grid-cols-12">
                    <div className="flex min-h-0 flex-col md:col-span-8">
                      <label className="mt-4 block shrink-0 border-b border-[var(--color-ink)] pb-3 transition-colors duration-[var(--duration-quiet)] focus-within:border-[var(--color-navy)] md:mt-10">
                        <span className="sr-only">商品を検索</span>
                        <input
                          ref={inputRef}
                          type="text"
                          inputMode="search"
                          enterKeyHint="search"
                          autoComplete="off"
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="46G、Box、コンパクト糸…"
                          className="w-full bg-transparent text-[24px] font-bold tracking-[0.06em] text-[var(--color-ink)] outline-none focus-visible:outline-none placeholder:font-normal placeholder:text-[var(--color-ink-faint)] md:text-[32px]"
                        />
                      </label>

                      <div className="mt-5 flex shrink-0 flex-wrap items-center gap-2">
                        <span className="type-caption mr-2">ゲージ</span>
                        {GAUGE_LADDER.map((spec) => (
                          <Link
                            key={spec.fabricSlug}
                            href={`/fabric/${spec.fabricSlug}`}
                            onClick={close}
                            className="inline-flex min-h-10 items-center border border-[var(--color-navy)] px-4 font-en text-[14px] tracking-[0.06em] tabular-nums text-[var(--color-navy)] transition-colors duration-[var(--duration-quiet)] hover:bg-[var(--color-navy)] hover:text-white"
                          >
                            {spec.gauge}G
                          </Link>
                        ))}
                      </div>

                      <p
                        className="type-label mt-8 shrink-0 tabular-nums"
                        aria-live="polite"
                      >
                        {trimmed
                          ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                          : "All pieces"}
                      </p>

                      <ul className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-y-contain border-t border-[var(--color-hairline)] pb-8">
                        {results.map(({ product, displayName, meta }) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={close}
                              className="group flex items-center gap-4 border-b border-[var(--color-hairline)] py-3"
                            >
                              <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-[var(--color-image-placeholder)]">
                                <Image
                                  src={product.imageUrl}
                                  alt=""
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-en text-[17px] leading-snug tracking-[0.02em] text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] group-hover:text-[var(--color-navy)]">
                                  {displayName}
                                </span>
                                {meta ? (
                                  <span className="type-caption block truncate">
                                    {meta}
                                  </span>
                                ) : null}
                              </span>
                              <span className="shrink-0 font-en text-[15px] tracking-[0.02em] tabular-nums text-[var(--color-ink)]">
                                {formatPrice(product.price)}
                              </span>
                            </Link>
                          </li>
                        ))}

                        {trimmed && results.length === 0 ? (
                          <li className="type-body py-8 text-[var(--color-ink-soft)]">
                            「{query.trim()}
                            」に一致する商品はありません。ゲージ（28G・36G・46G）かシルエット（Regular・Box）でお探しください。
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
