import {
  measurementOf,
  resolveStock,
  siblingOf,
  stockOf,
  toCard,
  type CatalogEntry,
  type ConciergeCatalog,
  type StockNote,
} from "@/lib/concierge/catalog";
import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import type {
  ConciergeCard,
  ConciergeLanguage,
  ConciergeLink,
  ConciergeReply,
  RawConciergeResult,
  RawRecommendation,
} from "@/lib/concierge/types";
import type { ProductSize } from "@/types";

/**
 * Everything between "a recommendation was produced" and "it is safe to
 * show": schema validation of untrusted model output, catalog checks, the
 * stock policy, and joining picks with live product data. Both the model
 * path and the rules path go through finalizeResult(), so the guarantees
 * here hold no matter which one answered.
 */

/**
 * Words the storefront never prints. A model reply containing one is thrown
 * away whole (the rules path answers instead) rather than edited.
 */
const BANNED_PATTERNS: RegExp[] = [
  /kanemasa\s*phil/i,
  /カネマサ\s*フィル/,
  /仮/,
  // Machine numbers / machine sizes: "3号機", "No.12", "30インチ機", "30-inch machine".
  /\d+\s*号機/,
  /\d+\s*(?:インチ|inch|")[-\s]*(?:の)?(?:編機|機|machine|cylinder|diameter)/i,
  /(?:machine|機械)\s*(?:no\.?|number|番号)/i,
  /https?:\/\//i,
];

const VALID_SIZES: ProductSize[] = ["S", "M", "L", "XL"];

const ALLOWED_LINKS: Array<{ href: string; ja: string; en: string }> = [
  { href: "/store-guide", ja: "ご利用ガイド", en: "Store guide" },
  { href: "/shipping", ja: "配送・返品について", en: "Shipping & returns" },
  { href: "/contact", ja: "お問い合わせ", en: "Contact" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxChars: number): string | null {
  if (typeof value !== "string") return null;

  const text = value
    // Control characters other than newline; the UI renders plain text.
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return null;

  return text.length > maxChars ? `${text.slice(0, maxChars - 1).trimEnd()}…` : text;
}

function containsBanned(text: string): boolean {
  return BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

function validateRecommendation(
  value: unknown,
  catalog: ConciergeCatalog,
): RawRecommendation | null {
  if (!isRecord(value)) return null;

  const slug = typeof value.productSlug === "string" ? value.productSlug : "";
  const entry = catalog.bySlug.get(slug);

  // Unknown product: drop the whole recommendation.
  if (!entry) return null;

  const rawSize =
    typeof value.size === "string" ? value.size.trim().toUpperCase() : null;
  // A size this product is not sold in becomes "no size yet", not a guess.
  const size =
    rawSize !== null &&
    VALID_SIZES.includes(rawSize as ProductSize) &&
    entry.sizes.includes(rawSize as ProductSize)
      ? (rawSize as ProductSize)
      : null;

  const reason = cleanText(value.reason, CONCIERGE_LIMITS.maxReasonChars);
  if (!reason) return null;

  return { productSlug: entry.product.slug, size, reason };
}

/**
 * Validate untrusted structured output against the live catalog.
 * Returns null when the output as a whole cannot be used.
 */
export function validateModelOutput(
  value: unknown,
  catalog: ConciergeCatalog,
): RawConciergeResult | null {
  if (!isRecord(value)) return null;

  const reply = cleanText(value.reply, CONCIERGE_LIMITS.maxReplyChars);
  if (!reply) return null;

  const primary = validateRecommendation(value.primary, catalog);
  let alternative = validateRecommendation(value.alternative, catalog);

  // An alternative without a primary is promoted; a duplicate is dropped.
  const first = primary ?? alternative;
  if (!primary) alternative = null;

  if (
    first &&
    alternative &&
    alternative.productSlug === first.productSlug &&
    alternative.size === first.size
  ) {
    alternative = null;
  }

  const followUpQuestion = cleanText(
    value.followUpQuestion,
    CONCIERGE_LIMITS.maxFollowUpChars,
  );

  const allText = [reply, first?.reason, alternative?.reason, followUpQuestion]
    .filter(Boolean)
    .join("\n");

  if (containsBanned(allText)) return null;

  return { reply, primary: first, alternative, followUpQuestion };
}

function stockNoteText(
  note: StockNote,
  catalog: ConciergeCatalog,
  language: ConciergeLanguage,
): string {
  const nameOf = (slug: string) => catalog.bySlug.get(slug)?.product.name ?? slug;

  if (note.kind === "size_swapped") {
    return language === "en"
      ? `${nameOf(note.slug)} is sold out in ${note.from}. The nearest size in stock is ${note.to}.`
      : `${nameOf(note.slug)} の ${note.from} は現在在庫切れです。在庫のある近いサイズは ${note.to} です。`;
  }

  if (note.kind === "product_swapped") {
    const sizeText = note.size ?? "";

    return language === "en"
      ? `${nameOf(note.fromSlug)} is sold out${sizeText ? ` in ${sizeText}` : ""}. ${nameOf(note.toSlug)} is in stock${sizeText ? ` in ${sizeText}` : ""}.`
      : `${nameOf(note.fromSlug)}${sizeText ? ` の ${sizeText}` : ""} は現在在庫切れです。${nameOf(note.toSlug)}${sizeText ? ` の ${sizeText}` : ""} は在庫があります。`;
  }

  return language === "en"
    ? `${nameOf(note.slug)} is sold out${note.size ? ` in ${note.size}` : ""}, and no nearby size or piece is in stock right now.`
    : `${nameOf(note.slug)}${note.size ? ` の ${note.size}` : ""} は現在在庫切れで、近いサイズ・近い型にも在庫がありません。`;
}

/**
 * Reason shown on a card that replaced a sold-out pick. The original reason
 * argued for a size or piece that is no longer the one on the card, so this
 * is rebuilt from the spec sheet and size guide.
 */
function swapReason(
  entry: CatalogEntry,
  size: ProductSize | null,
  language: ConciergeLanguage,
): string {
  const { spec } = entry;
  const row = size ? measurementOf(entry, size) : undefined;
  const en = language === "en";

  const fabric = spec
    ? en
      ? `${spec.gauge}G, ${spec.weightGsm} g/m². `
      : `${spec.gauge}G・${spec.yarn}・目付${spec.weightGsm}g/m²。`
    : "";
  const measure =
    row && size
      ? en
        ? `${entry.silhouette} ${size} measures ${row.chest} cm across the chest and ${row.length} cm in length. `
        : `${entry.silhouette} ${size}は身幅${row.chest}cm・着丈${row.length}cmです。`
      : "";

  return en
    ? `${fabric}${measure}Offered because the first choice is sold out.`
    : `${fabric}${measure}第一候補が在庫切れのためのご案内です。`;
}

function backupAlternative(
  primaryEntry: CatalogEntry,
  size: ProductSize | null,
  catalog: ConciergeCatalog,
  language: ConciergeLanguage,
): RawRecommendation | null {
  const sibling = siblingOf(catalog, primaryEntry);
  if (!sibling || size === null || stockOf(sibling, size) < 1) return null;

  const own = measurementOf(primaryEntry, size);
  const other = measurementOf(sibling, size);
  const delta = own && other ? Math.abs(other.chest - own.chest) : null;
  const wider = own && other ? other.chest > own.chest : sibling.silhouette === "Box";

  const reason =
    language === "en"
      ? `Same gauge in ${size}, in stock.${delta ? ` ${delta} cm ${wider ? "wider" : "narrower"} in the chest than ${primaryEntry.silhouette}.` : ""}`
      : `同じゲージの ${size} で在庫があります。${delta ? `${primaryEntry.silhouette}より身幅が${delta}cm${wider ? "広い" : "狭い"}形です。` : ""}`;

  return { productSlug: sibling.product.slug, size, reason };
}

function linksFromText(text: string, language: ConciergeLanguage): ConciergeLink[] {
  return ALLOWED_LINKS.filter(({ href }) => text.includes(href)).map(
    ({ href, ja, en }) => ({ href, label: language === "en" ? en : ja }),
  );
}

/**
 * Apply the stock policy and join with the catalog.
 *
 * - A sold-out primary is replaced by the nearest thing that can be bought,
 *   and the reply says so in a sentence written here, not by the model.
 * - A sold-out alternative is dropped.
 * - Picks that do not resolve to a catalog entry are dropped.
 */
export function finalizeResult(
  raw: RawConciergeResult,
  catalog: ConciergeCatalog,
  language: ConciergeLanguage,
  extraLinks: ConciergeLink[] = [],
): ConciergeReply {
  let reply = raw.reply;
  let primaryCard: ConciergeCard | null = null;
  let alternativeCard: ConciergeCard | null = null;
  let alternative = raw.alternative;

  if (raw.primary && catalog.bySlug.has(raw.primary.productSlug)) {
    const wanted = raw.primary;
    const { pick, note } = resolveStock(catalog, {
      slug: wanted.productSlug,
      size: wanted.size,
    });
    const entry = catalog.bySlug.get(pick.slug)!;

    if (note) {
      // Replaces the reply outright: whatever was written assumed the
      // original pick could be bought.
      reply = stockNoteText(note, catalog, language);

      if (note.kind !== "unavailable") {
        // The alternative was reasoned against the original pick; replace it
        // with something that is simply true of what is now on offer.
        // The size they were after, in the other silhouette, if it can be bought.
        alternative = backupAlternative(entry, wanted.size, catalog, language);
      }
    }

    primaryCard = toCard(
      entry,
      pick.size,
      note && note.kind !== "unavailable"
        ? swapReason(entry, pick.size, language)
        : wanted.reason,
    );
  }

  if (alternative && primaryCard) {
    const entry = catalog.bySlug.get(alternative.productSlug);
    const sameAsPrimary =
      alternative.productSlug === primaryCard.productSlug &&
      alternative.size === primaryCard.size;
    const soldOut =
      entry !== undefined &&
      (alternative.size === null
        ? !entry.sizes.some((size) => stockOf(entry, size) > 0)
        : stockOf(entry, alternative.size) < 1);

    if (entry && !sameAsPrimary && !soldOut) {
      alternativeCard = toCard(entry, alternative.size, alternative.reason);
    }
  }

  const links = [...extraLinks, ...linksFromText(reply, language)].filter(
    (item, index, all) =>
      all.findIndex((other) => other.href === item.href) === index,
  );

  return {
    reply,
    primary: primaryCard,
    alternative: alternativeCard,
    followUpQuestion: raw.followUpQuestion,
    links,
  };
}
