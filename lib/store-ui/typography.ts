/**
 * Storefront typography — quiet editorial scale, bumped for readability.
 * Use these semantic classes instead of raw pixel sizes where possible.
 */
export const STORE_TYPO = {
  /** Section eyebrows, metadata */
  caption: "text-[12px] font-light tracking-[0.12em] text-neutral-600",
  /** Default body, nav links */
  body: "text-[13px] font-light leading-[1.9] tracking-[0.04em] text-neutral-600",
  /** Secondary body, descriptions */
  bodyMuted:
    "text-[13px] font-light leading-[2] tracking-[0.03em] text-neutral-600",
  /** Page / section titles */
  title: "text-[15px] font-light tracking-[0.24em] text-neutral-800",
  /** Home editorial body */
  editorialBody:
    "text-[14px] font-light leading-[1.9] tracking-[0.04em] text-[#505050] md:text-[15px]",
  /** Home editorial label */
  editorialLabel:
    "text-[12px] font-light tracking-[0.18em] text-[#7a7a7a]",
} as const;
