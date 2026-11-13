/**
 * Indicative exchange rates for the English storefront.
 *
 * Orders are always charged in Japanese yen. These rates only produce the
 * "approx." figure shown beside the yen price. There is no live FX call:
 * the defaults below are static and can be overridden per deployment.
 *
 * Overrides (server env, read when a page is rendered or built):
 *   FX_RATES_JSON='{"USD":0.0065,"EUR":0.006,"GBP":0.0051,"asOf":"2026-11-01"}'
 * or individually
 *   FX_USD_PER_JPY=0.0065  FX_EUR_PER_JPY=0.006  FX_GBP_PER_JPY=0.0051
 *   FX_AS_OF=2026-11-01
 */
export const CURRENCIES = ["USD", "EUR", "GBP"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "USD";

export function isCurrency(value: unknown): value is Currency {
  return value === "USD" || value === "EUR" || value === "GBP";
}

export type FxRates = {
  /** Units of the foreign currency per one Japanese yen. */
  perJpy: Record<Currency, number>;
  /** Date the rates were set, ISO `YYYY-MM-DD`. */
  asOf: string;
};

/**
 * PLACEHOLDER DEFAULTS — to be confirmed by the business before launch.
 * Roughly ¥154 = US$1, ¥167 = €1, ¥196 = £1.
 */
export const DEFAULT_FX_RATES: FxRates = {
  perJpy: {
    USD: 0.0065,
    EUR: 0.006,
    GBP: 0.0051,
  },
  asOf: "2026-11-01",
};

function parseRate(value: unknown): number | null {
  const rate = typeof value === "string" ? Number(value) : value;
  // A yen is worth far less than one dollar, euro or pound; anything outside
  // this window is a typo (e.g. JPY-per-USD entered the wrong way round).
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 && rate < 1
    ? rate
    : null;
}

function parseAsOf(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null;
}

/** Rates from env, falling back to the static defaults key by key. */
export function getFxRates(
  env: Record<string, string | undefined> = process.env,
): FxRates {
  let json: Record<string, unknown> = {};

  if (env.FX_RATES_JSON) {
    try {
      const parsed: unknown = JSON.parse(env.FX_RATES_JSON);
      if (parsed && typeof parsed === "object") {
        json = parsed as Record<string, unknown>;
      }
    } catch {
      // Malformed JSON: ignore and use the other sources.
    }
  }

  const perJpy = { ...DEFAULT_FX_RATES.perJpy };

  for (const currency of CURRENCIES) {
    perJpy[currency] =
      parseRate(env[`FX_${currency}_PER_JPY`]) ??
      parseRate(json[currency]) ??
      DEFAULT_FX_RATES.perJpy[currency];
  }

  return {
    perJpy,
    asOf:
      parseAsOf(env.FX_AS_OF) ?? parseAsOf(json.asOf) ?? DEFAULT_FX_RATES.asOf,
  };
}
