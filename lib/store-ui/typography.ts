/**
 * Storefront typography — maps 1:1 to design tokens in globals.css.
 * Allowed sizes only: Display 22–26 / H2 20 / Label 11 / Body 14 / Caption 12 / Fine 11.
 * Weights: 400 (regular) or 500 (medium). Never bold (700+).
 */
export const STORE_TYPO = {
  /** Hero headline only */
  display: "type-display",
  /** Section / page Japanese headings */
  h2: "type-h2",
  /** English section labels */
  label: "type-label",
  /** Default body copy */
  body: "type-body text-[var(--color-ink-soft)]",
  /** Body on ink (darker) */
  bodyInk: "type-body text-[var(--color-ink)]",
  /** Secondary / meta */
  caption: "type-caption",
  /** Legal notes, breadcrumbs, annotations */
  fine: "type-fine",
  /** @deprecated Prefer `label` */
  editorialLabel: "type-label",
  /** @deprecated Prefer `body` */
  editorialBody: "type-body text-[var(--color-ink-soft)]",
  /** @deprecated Prefer `label` */
  title: "type-label text-[var(--color-ink)]",
  /** @deprecated Prefer `label` */
  catalogTitle: "type-label",
  /** @deprecated Prefer `h2` */
  pdpTitle: "type-h2",
  /** @deprecated Prefer `bodyInk` */
  pdpPrice: "type-body text-[var(--color-ink)]",
  /** @deprecated Prefer `caption` */
  pdpBrand: "type-caption",
} as const;

/** Purchase column width — readable on mobile and desktop. */
export const PURCHASE_BOX_CLASS =
  "mx-auto flex w-full max-w-[24rem] flex-col sm:max-w-[22rem] lg:max-w-[20rem] xl:max-w-[22rem]";
