/** Shared storage flag for the "also available in English" suggestion. */
export const LOCALE_SUGGESTION_KEY = "wt-locale-suggest";
export const LOCALE_SUGGESTION_EVENT = "wt-locale-suggest-change";

/**
 * Called when the visitor dismisses the suggestion or picks a language
 * themselves: either way, do not suggest again.
 */
export function rememberLocaleChoice(): void {
  try {
    window.localStorage.setItem(LOCALE_SUGGESTION_KEY, "dismissed");
  } catch {
    // Storage unavailable: the bar may show again on the next visit.
  }
  window.dispatchEvent(new Event(LOCALE_SUGGESTION_EVENT));
}

export function isLocaleSuggestionDismissed(): boolean {
  try {
    return window.localStorage.getItem(LOCALE_SUGGESTION_KEY) !== null;
  } catch {
    return false;
  }
}
