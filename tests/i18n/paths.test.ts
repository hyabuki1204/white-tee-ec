import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLocale } from "@/lib/i18n/config";
import { cmToInches, joinSpec } from "@/lib/i18n/format";
import { localizePath, stripLocale, switchLocalePath } from "@/lib/i18n/paths";
import {
  buildPageMetadata,
  languageAlternates,
  localizedUrl,
} from "@/lib/seo/metadata";

describe("locale paths", () => {
  it("recognises the two locales and nothing else", () => {
    assert.equal(isLocale("ja"), true);
    assert.equal(isLocale("en"), true);
    assert.equal(isLocale("fr"), false);
    assert.equal(isLocale(undefined), false);
  });

  it("leaves Japanese unprefixed and prefixes English", () => {
    assert.equal(localizePath("/", "ja"), "/");
    assert.equal(localizePath("/", "en"), "/en");
    assert.equal(localizePath("/products", "ja"), "/products");
    assert.equal(localizePath("/products", "en"), "/en/products");
    assert.equal(
      localizePath("/products/46g-regular-tee", "en"),
      "/en/products/46g-regular-tee",
    );
  });

  it("keeps the query string and the hash", () => {
    assert.equal(
      localizePath("/products?fabric=46g-jersey&fit=boxy", "en"),
      "/en/products?fabric=46g-jersey&fit=boxy",
    );
    assert.equal(localizePath("/#gauge", "en"), "/en#gauge");
    assert.equal(localizePath("/#gauge", "ja"), "/#gauge");
    assert.equal(
      localizePath("/concierge?from=46g-box-tee", "en"),
      "/en/concierge?from=46g-box-tee",
    );
  });

  it("never prefixes twice and can move a prefixed path back", () => {
    assert.equal(localizePath("/en/products", "en"), "/en/products");
    assert.equal(localizePath("/en/products", "ja"), "/products");
    assert.equal(localizePath("/en", "ja"), "/");
    assert.equal(localizePath("/ja/products", "en"), "/en/products");
  });

  it("passes through what is not a storefront page", () => {
    for (const href of [
      "#size-guide",
      "https://www.instagram.com/",
      "mailto:hello@example.com",
      "//cdn.example.com/a.js",
      "/api/checkout",
      "/admin/orders",
      "/home/hero-46g.jpg",
      "/sitemap.xml",
    ]) {
      assert.equal(localizePath(href, "en"), href, href);
    }
  });

  it("does not mistake a path that merely starts with a locale code", () => {
    assert.deepEqual(stripLocale("/english"), {
      locale: "ja",
      pathname: "/english",
    });
    assert.equal(localizePath("/english", "en"), "/en/english");
  });

  it("splits a pathname into locale and bare path", () => {
    assert.deepEqual(stripLocale("/en/saved"), { locale: "en", pathname: "/saved" });
    assert.deepEqual(stripLocale("/en"), { locale: "en", pathname: "/" });
    assert.deepEqual(stripLocale("/saved"), { locale: "ja", pathname: "/saved" });
    assert.deepEqual(stripLocale("/"), { locale: "ja", pathname: "/" });
  });

  it("switches language on the same page, preserving the query", () => {
    assert.equal(
      switchLocalePath("/products", "fabric=46g-jersey", "en"),
      "/en/products?fabric=46g-jersey",
    );
    assert.equal(
      switchLocalePath("/en/products", "?fabric=46g-jersey&stock=in", "ja"),
      "/products?fabric=46g-jersey&stock=in",
    );
    assert.equal(switchLocalePath("/en", "", "ja"), "/");
    assert.equal(switchLocalePath("/", "", "en"), "/en");
    assert.equal(
      switchLocalePath("/products/46g-regular-tee", "size=M", "en"),
      "/en/products/46g-regular-tee?size=M",
    );
  });
});

describe("locale-aware metadata", () => {
  it("builds absolute URLs per locale", () => {
    assert.match(localizedUrl("/products", "ja"), /\/products$/);
    assert.match(localizedUrl("/products", "en"), /\/en\/products$/);
  });

  it("lists ja, en and x-default (Japanese) as hreflang alternates", () => {
    const languages = languageAlternates("/fabric/46g-jersey");

    assert.deepEqual(Object.keys(languages), ["ja", "en", "x-default"]);
    assert.match(languages.ja!, /\/fabric\/46g-jersey$/);
    assert.match(languages.en!, /\/en\/fabric\/46g-jersey$/);
    assert.equal(languages["x-default"], languages.ja);
  });

  it("sets canonical, og:locale and alternates from the page locale", () => {
    const english = buildPageMetadata({
      title: "Mill",
      path: "/about",
      locale: "en",
    });
    const japanese = buildPageMetadata({
      title: "Mill",
      path: "/about",
      locale: "ja",
    });

    assert.match(String(english.alternates?.canonical), /\/en\/about$/);
    assert.doesNotMatch(String(japanese.alternates?.canonical), /\/en\//);
    assert.equal(english.openGraph?.locale, "en_GB");
    assert.equal(japanese.openGraph?.locale, "ja_JP");
    assert.deepEqual(english.openGraph?.alternateLocale, ["ja_JP"]);
  });

  it("omits hreflang for a language the page does not exist in", () => {
    const metadata = buildPageMetadata({
      title: "Entry",
      path: "/journal/only-japanese",
      locale: "ja",
      availableLocales: ["ja"],
    });
    const languages = metadata.alternates?.languages as Record<string, string>;

    assert.deepEqual(Object.keys(languages), ["ja", "x-default"]);
    assert.equal(metadata.openGraph?.alternateLocale, undefined);
  });
});

describe("locale formatting helpers", () => {
  it("joins spec fragments with the separator of the language", () => {
    assert.equal(joinSpec("ja", "40/2 コーマ糸", "240g/m²"), "40/2 コーマ糸・240g/m²");
    assert.equal(
      joinSpec("en", "40/2 combed cotton", "240g/m²"),
      "40/2 combed cotton · 240g/m²",
    );
    assert.equal(joinSpec("en", "a", null, "b"), "a · b");
  });

  it("converts centimetres to inches, to the nearest quarter", () => {
    assert.equal(cmToInches(70), "27½");
    assert.equal(cmToInches(54), "21¼");
    assert.equal(cmToInches(46), "18");
    assert.equal(cmToInches(20), "7¾");
    assert.equal(cmToInches(2.54), "1");
  });
});
