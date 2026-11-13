/**
 * Shared control styles for storefront pages. Square corners, no shadows.
 * primary = navy fill / secondary = navy outline / onDark = white outline.
 */
const buttonBase =
  "inline-flex min-h-12 items-center justify-center px-10 text-center text-[13px] tracking-[0.16em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] disabled:cursor-not-allowed";

export const buttonPrimaryClass = `${buttonBase} bg-[var(--color-navy)] text-white hover:bg-[var(--color-ink)] disabled:bg-[var(--color-hairline)] disabled:text-[var(--color-ink-faint)]`;

export const buttonSecondaryClass = `${buttonBase} border border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white disabled:border-[var(--color-hairline)] disabled:text-[var(--color-ink-faint)]`;

export const buttonOnDarkClass = `${buttonBase} border border-white text-white hover:bg-white hover:text-[#15181c]`;

/** Inline text link: ink, underlined, navy on hover. */
export const textLinkClass =
  "text-[13px] tracking-[0.04em] text-[var(--color-ink)] underline decoration-[var(--color-hairline)] underline-offset-[6px] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:text-[var(--color-navy)] hover:decoration-[var(--color-navy)]";

/** Standard page gutter on the 12-column max-w-7xl grid. */
export const pageGutterClass = "mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12";
