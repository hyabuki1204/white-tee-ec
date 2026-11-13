"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/Link";
import { useEffect, useRef, useState } from "react";
import { getInCartQuantity } from "@/lib/cart/stock-validation";
import { useCartStore } from "@/lib/cart/store";
import type { ConciergeCard as ConciergeCardData } from "@/lib/concierge/types";
import { ApproxPrice } from "@/components/currency/ApproxPrice";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getConciergeCopy } from "@/lib/concierge/ui-copy";
import { getProductCopy, type SiteUiCopy } from "@/lib/copy/site-ui";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils";

type ConciergeCardProps = {
  card: ConciergeCardData;
  kind: "primary" | "alternative";
};

const ADDED_LABEL_MS = 1500;

const buttonBase =
  "flex min-h-12 flex-1 items-center justify-center gap-3 border px-5 text-[13px] tracking-[0.06em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]";
const navyFilled =
  "border-[var(--color-navy)] bg-[var(--color-navy)] text-white hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]";
const navyOutline =
  "border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white";

type CardCopy = ReturnType<typeof getConciergeCopy>["card"];

function stockLabel(
  card: ConciergeCardData,
  copy: CardCopy,
  productCopy: SiteUiCopy["product"],
): string {
  switch (card.stock) {
    case "in_stock":
      return copy.inStock;
    case "low":
      return copy.low(card.available);
    case "out":
      return productCopy.outOfStock;
    default:
      return copy.sizeUndecided;
  }
}

/** One recommendation: gauge numeral, piece, size, price, stock, reason. */
export function ConciergeCard({ card, kind }: ConciergeCardProps) {
  const locale = useLocale();
  const copy = getConciergeCopy(locale).card;
  const productCopy = getProductCopy(locale);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const isPrimary = kind === "primary";
  const inCart = card.size
    ? getInCartQuantity(cartItems, card.productId, card.size)
    : 0;
  const canBuy = card.size !== null && card.available > 0;
  const atLimit = canBuy && inCart >= card.available;

  const handleAdd = () => {
    if (!card.size || !canBuy || atLimit) return;

    addItem({ productId: card.productId, variant: card.size, price: card.price });
    setJustAdded(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), ADDED_LABEL_MS);
  };

  const title = `${card.name}${card.size ? ` ${card.size}` : ""}`;

  return (
    <article
      aria-label={`${isPrimary ? copy.primary : copy.alternative}: ${title}`}
      className={cn(
        "border bg-[var(--color-surface)]",
        isPrimary
          ? "border-[var(--color-ink)]"
          : "border-[var(--color-hairline)]",
      )}
    >
      <p
        className={cn(
          "type-label border-b px-5 py-3",
          isPrimary
            ? "border-[var(--color-ink)] !text-[var(--color-navy)]"
            : "border-[var(--color-hairline)]",
        )}
      >
        {isPrimary ? copy.primaryHeading : copy.alternative}
      </p>

      <div className="flex gap-5 px-5 pt-5">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-[var(--color-bg-warm)]",
            isPrimary ? "w-24 sm:w-32" : "w-20 sm:w-24",
          )}
        >
          <div className="aspect-[4/5]">
            <Image
              src={card.imageUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {card.gauge !== null ? (
            <p
              aria-hidden
              className={cn(
                "font-en font-light leading-[0.85] tracking-[-0.04em] text-[var(--color-ink)] tabular-nums",
                isPrimary
                  ? "text-[72px] sm:text-[96px]"
                  : "text-[48px] sm:text-[56px]",
              )}
            >
              {card.gauge}
              <span className="ml-1 text-[0.3em] font-normal tracking-[0.04em]">
                G
              </span>
            </p>
          ) : null}

          <h3 className="font-en mt-3 text-[16px] tracking-[0.04em] text-[var(--color-ink)]">
            {card.name}
          </h3>

          <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[var(--color-ink-soft)]">
            <div className="flex gap-2">
              <dt>{copy.size}</dt>
              <dd className="font-en text-[var(--color-ink)]">
                {card.size ?? "—"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">{copy.price}</dt>
              <dd className="font-en text-[var(--color-ink)] tabular-nums">
                {formatPrice(card.price)}
                <ApproxPrice amount={card.price} className="ml-1.5 text-[12px]" />
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">{copy.stock}</dt>
              <dd
                className={cn(
                  card.stock === "out" && "text-[var(--color-ink-faint)]",
                )}
              >
                {stockLabel(card, copy, productCopy)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="type-body px-5 pt-4 text-[var(--color-ink)]">{card.reason}</p>

      <div className="flex flex-col gap-2 p-5 sm:flex-row">
        <Link
          href={card.href}
          className={cn(buttonBase, isPrimary ? navyFilled : navyOutline)}
        >
          {card.size ? copy.viewInSize(card.size) : copy.view}
          <span aria-hidden className="font-en">
            →
          </span>
        </Link>

        {canBuy ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={atLimit}
            className={cn(
              buttonBase,
              atLimit
                ? "cursor-not-allowed border-[var(--color-hairline)] text-[var(--color-ink-faint)]"
                : navyOutline,
            )}
          >
            {justAdded
              ? productCopy.addedConfirm
              : atLimit
                ? productCopy.maxInBag
                : copy.addSize(card.size ?? "")}
          </button>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {justAdded ? copy.addedAnnouncement(title) : ""}
      </p>
    </article>
  );
}
