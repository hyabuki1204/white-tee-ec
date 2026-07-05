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
  /** PLP / home catalog heading */
  catalogTitle:
    "text-[16px] font-light tracking-[0.24em] text-neutral-900 md:text-[18px]",
  /** PDP product name */
  pdpTitle:
    "text-[18px] font-light leading-[1.45] tracking-[0.03em] text-neutral-900 md:text-[20px] lg:text-[22px]",
  /** PDP price */
  pdpPrice:
    "text-[17px] font-light tracking-[0.04em] text-neutral-800 md:text-[19px]",
  /** PDP brand line */
  pdpBrand: "text-[12px] font-light tracking-[0.2em] text-neutral-600",
  /** Home editorial body */
  editorialBody:
    "text-[14px] font-light leading-[1.9] tracking-[0.04em] text-[#505050] md:text-[15px]",
  /** Home editorial label */
  editorialLabel:
    "text-[12px] font-light tracking-[0.18em] text-[#7a7a7a]",
} as const;

/** Purchase column width — readable on mobile and desktop. */
export const PURCHASE_BOX_CLASS =
  "mx-auto flex w-full max-w-[24rem] flex-col sm:max-w-[22rem] lg:max-w-[20rem] xl:max-w-[22rem]";
