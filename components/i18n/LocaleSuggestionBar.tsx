"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  isLocaleSuggestionDismissed,
  LOCALE_SUGGESTION_EVENT,
  rememberLocaleChoice,
} from "@/components/i18n/locale-suggestion";
import { switchLocalePath } from "@/lib/i18n/paths";

function subscribe(onChange: () => void) {
  window.addEventListener(LOCALE_SUGGESTION_EVENT, onChange);
  return () => window.removeEventListener(LOCALE_SUGGESTION_EVENT, onChange);
}

/** Show only to browsers whose preferred language is not Japanese. */
function shouldSuggest(): boolean {
  const language = window.navigator.language ?? "";
  return !language.toLowerCase().startsWith("ja") && !isLocaleSuggestionDismissed();
}

/**
 * One quiet line on Japanese pages, for visitors whose browser is not set to
 * Japanese: "This store is also available in English →". Nobody is
 * redirected; the visitor chooses. Dismissing it (or following it, or using
 * the JP / EN switch) is remembered in localStorage.
 *
 * Rendered after hydration only, so the server HTML of Japanese pages is the
 * same for everyone. Needs a Suspense boundary (reads the search params).
 */
export function LocaleSuggestionBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const visible = useSyncExternalStore(subscribe, shouldSuggest, () => false);

  if (locale !== "ja" || !visible) return null;

  return (
    <aside
      lang="en"
      aria-label="Language suggestion"
      className="border-b border-[var(--color-hairline)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto flex min-h-11 w-full max-w-7xl items-center justify-between gap-6 px-6 md:px-8 lg:px-12">
        <NextLink
          href={switchLocalePath(pathname, search, "en")}
          hrefLang="en"
          onClick={rememberLocaleChoice}
          className="font-en py-2 text-[13px] tracking-[0.04em] text-[var(--color-ink)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:text-[var(--color-navy)]"
        >
          This store is also available in English
          <span aria-hidden className="ml-2">
            →
          </span>
        </NextLink>
        <button
          type="button"
          onClick={rememberLocaleChoice}
          className="font-en inline-flex min-h-11 shrink-0 items-center text-[12px] tracking-[0.08em] text-[var(--color-ink-faint)] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:text-[var(--color-ink)]"
        >
          Close
        </button>
      </div>
    </aside>
  );
}
