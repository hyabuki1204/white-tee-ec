"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { rememberLocaleChoice } from "@/components/i18n/locale-suggestion";
import { LOCALES, LOCALE_SWITCH_LABEL, type Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

/** Accessible names, written in the language of the current page. */
const LANGUAGE_NAME: Record<Locale, Record<Locale, string>> = {
  ja: { ja: "日本語", en: "English" },
  en: { ja: "Japanese", en: "English" },
};

const GROUP_LABEL: Record<Locale, string> = {
  ja: "言語",
  en: "Language",
};

type LocaleSwitchProps = {
  className?: string;
  onNavigate?: () => void;
};

/**
 * "JP / EN" — goes to the same page in the other language, keeping the path
 * and the query string. Must be rendered inside a Suspense boundary
 * (it reads the search params).
 */
export function LocaleSwitch({ className, onNavigate }: LocaleSwitchProps) {
  const current = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  return (
    <div
      role="group"
      aria-label={GROUP_LABEL[current]}
      className={cn(
        "font-en inline-flex items-center text-[13px] font-medium tracking-[0.08em]",
        className,
      )}
    >
      {LOCALES.map((locale, index) => {
        const active = locale === current;

        return (
          <Fragment key={locale}>
            {index > 0 ? (
              <span aria-hidden className="mx-1.5 text-[var(--color-ink-faint)]">
                /
              </span>
            ) : null}
            <NextLink
              href={switchLocalePath(pathname, search, locale)}
              hrefLang={locale}
              aria-label={LANGUAGE_NAME[current][locale]}
              aria-current={active ? "true" : undefined}
              onClick={() => {
                rememberLocaleChoice();
                onNavigate?.();
              }}
              className={cn(
                "inline-flex min-h-11 items-center transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
                active
                  ? "text-[var(--color-ink)] underline decoration-[var(--color-ink)] underline-offset-[6px]"
                  : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
              )}
            >
              {LOCALE_SWITCH_LABEL[locale]}
            </NextLink>
          </Fragment>
        );
      })}
    </div>
  );
}
