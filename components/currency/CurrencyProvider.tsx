"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_CURRENCY,
  DEFAULT_FX_RATES,
  isCurrency,
  type Currency,
  type FxRates,
} from "@/lib/currency/config";

const STORAGE_KEY = "wt-currency";
const CHANGE_EVENT = "wt-currency-change";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  fx: FxRates;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  fx: DEFAULT_FX_RATES,
});

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStored(): Currency {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isCurrency(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

type CurrencyProviderProps = {
  /** Rates resolved on the server (static defaults or env overrides). */
  fx: FxRates;
  children: ReactNode;
};

/**
 * The visitor's display currency for indicative conversions (English pages).
 * Chosen by the visitor, remembered in localStorage. No geo-IP. Checkout is
 * always in Japanese yen.
 */
export function CurrencyProvider({ fx, children }: CurrencyProviderProps) {
  // The server cannot know the choice, so the first paint is the default.
  const currency = useSyncExternalStore(
    subscribe,
    readStored,
    () => DEFAULT_CURRENCY,
  );

  const setCurrency = useCallback((next: Currency) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice lasts for this page only.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency, fx }),
    [currency, setCurrency, fx],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
