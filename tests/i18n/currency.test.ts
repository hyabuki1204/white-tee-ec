import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_FX_RATES,
  getFxRates,
  isCurrency,
} from "@/lib/currency/config";
import {
  convertFromJpy,
  formatApprox,
  formatForeign,
  formatPriceWithApprox,
} from "@/lib/currency/format";

const FX = { perJpy: { USD: 0.0065, EUR: 0.006, GBP: 0.0051 }, asOf: "2026-11-01" };

describe("indicative currency", () => {
  it("offers USD, EUR and GBP, defaulting to USD", () => {
    assert.deepEqual([...CURRENCIES], ["USD", "EUR", "GBP"]);
    assert.equal(DEFAULT_CURRENCY, "USD");
    assert.equal(isCurrency("GBP"), true);
    assert.equal(isCurrency("JPY"), false);
    assert.equal(isCurrency(null), false);
  });

  it("has static default rates with an as-of date", () => {
    assert.match(DEFAULT_FX_RATES.asOf, /^\d{4}-\d{2}-\d{2}$/);

    for (const currency of CURRENCIES) {
      const rate = DEFAULT_FX_RATES.perJpy[currency];
      assert.ok(rate > 0 && rate < 1, `${currency} rate is per one yen`);
    }

    assert.deepEqual(getFxRates({}), DEFAULT_FX_RATES);
  });

  it("converts to whole units of the target currency", () => {
    assert.equal(convertFromJpy(18_000, "USD", FX), 117);
    assert.equal(convertFromJpy(18_000, "EUR", FX), 108);
    assert.equal(convertFromJpy(18_000, "GBP", FX), 92);
    assert.equal(convertFromJpy(0, "USD", FX), 0);
  });

  it("formats with the currency symbol and thousands separators", () => {
    assert.equal(formatForeign(117, "USD"), "US$117");
    assert.equal(formatForeign(108, "EUR"), "€108");
    assert.equal(formatForeign(92, "GBP"), "£92");
    assert.equal(formatForeign(1234, "USD"), "US$1,234");
  });

  it("always labels a converted amount as approximate, yen first", () => {
    assert.equal(formatApprox(18_000, "USD", FX), "approx. US$117");
    assert.equal(
      formatPriceWithApprox(18_000, "USD", FX),
      "¥18,000 (approx. US$117)",
    );
    assert.equal(
      formatPriceWithApprox(15_000, "GBP", FX),
      "¥15,000 (approx. £77)",
    );
  });

  it("reads overrides from individual env variables", () => {
    const fx = getFxRates({
      FX_USD_PER_JPY: "0.007",
      FX_AS_OF: "2027-01-15",
    });

    assert.equal(fx.perJpy.USD, 0.007);
    assert.equal(fx.perJpy.EUR, DEFAULT_FX_RATES.perJpy.EUR);
    assert.equal(fx.asOf, "2027-01-15");
  });

  it("reads overrides from one JSON env variable", () => {
    const fx = getFxRates({
      FX_RATES_JSON: '{"USD":0.0068,"EUR":0.0061,"GBP":0.0052,"asOf":"2027-02-01"}',
    });

    assert.deepEqual(fx, {
      perJpy: { USD: 0.0068, EUR: 0.0061, GBP: 0.0052 },
      asOf: "2027-02-01",
    });
  });

  it("prefers the individual variable over the JSON one", () => {
    const fx = getFxRates({
      FX_RATES_JSON: '{"USD":0.0068}',
      FX_USD_PER_JPY: "0.0071",
    });

    assert.equal(fx.perJpy.USD, 0.0071);
  });

  it("ignores malformed or implausible overrides", () => {
    const fx = getFxRates({
      FX_RATES_JSON: "{not json",
      // Entered the wrong way round (yen per dollar): would show ¥18,000 as US$2.7m.
      FX_USD_PER_JPY: "154",
      FX_EUR_PER_JPY: "abc",
      FX_GBP_PER_JPY: "-1",
      FX_AS_OF: "last Tuesday",
    });

    assert.deepEqual(fx, DEFAULT_FX_RATES);
  });
});
