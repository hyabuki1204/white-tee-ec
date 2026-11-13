"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

type LocaleProviderProps = {
  locale: Locale;
  children: ReactNode;
};

/** Set once in the root layout from the `[locale]` segment. */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Current storefront locale (client components). */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}
