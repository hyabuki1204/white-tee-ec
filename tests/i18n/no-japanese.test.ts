import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getConciergeCopy } from "@/lib/concierge/ui-copy";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import { getCurrencyCopy } from "@/lib/currency/copy";
import { getGaugeLadder } from "@/lib/fabric/gauge";
import { getFabricSpecRows } from "@/lib/fabric/specs";
import { FABRICS } from "@/lib/fabric/content";
import type { Locale } from "@/lib/i18n/config";
import {
  ABOUT_EN,
  JOURNAL_EN_BY_SLUG,
  JOURNAL_PAGE_EN,
  localizeFabrics,
  localizeJournalArticles,
  localizeProducts,
  PRODUCT_EN_BY_SLUG,
} from "@/lib/i18n/content-en";
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  ALLOWED_JAPANESE,
  collectStrings,
  containsJapanese,
  findJapanese,
} from "@/lib/i18n/japanese-text";
import { JOURNAL_ARTICLES } from "@/lib/content/journal-static";
import { getNewsletterCopy } from "@/lib/newsletter/use-newsletter-subscribe";
import { MOCK_PRODUCTS } from "@/lib/products/mock-products";
import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";
import { getRestockCopy } from "@/lib/restock/copy";
import { buildRestockEmail } from "@/lib/restock/notify";
import { getSavedCopy } from "@/lib/saved/copy";
import { getCheckoutTrustCopy } from "@/lib/store-ui/checkout-trust";
import { getFacts, getWearingNotes } from "@/lib/store-ui/credibility";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import {
  CONTACT_LEAD_EN,
  getContactPageCopy,
  getOverseasInterestCopy,
  getShippingPageCopy,
  LEGAL_NOTICE_EN,
  LEGAL_SUMMARY_EN,
  SHIPPING_SECTIONS_EN,
} from "@/lib/store-ui/info-pages";
import { getStorePrimaryNav } from "@/lib/store-ui/nav-links";
import {
  getReturnsPolicy,
  RETURNS_WINDOW_DAYS,
  SHIPS_WITHIN_JAPAN_ONLY,
} from "@/lib/store-ui/returns-policy";
import { getStockistCopy, MILL_LEGAL_NAME_EN } from "@/lib/store-ui/stockist";
import { getStoreGuide } from "@/lib/store-ui/store-guide";

/** Every dictionary the storefront reads, by name. */
const DICTIONARIES: Record<string, (locale: Locale) => unknown> = {
  "site-ui": getSiteUiCopy,
  store: getStoreCopy,
  returns: getReturnsPolicy,
  "checkout-trust": getCheckoutTrustCopy,
  saved: getSavedCopy,
  restock: getRestockCopy,
  newsletter: getNewsletterCopy,
  concierge: getConciergeCopy,
  currency: getCurrencyCopy,
  "store-guide": getStoreGuide,
  stockist: getStockistCopy,
  "shipping-page": getShippingPageCopy,
  "contact-page": getContactPageCopy,
  "overseas-interest": getOverseasInterestCopy,
  facts: getFacts,
  "wearing-notes": getWearingNotes,
  "gauge-ladder": getGaugeLadder,
  "primary-nav": getStorePrimaryNav,
};

/** English that is static (no Japanese counterpart in the same module). */
const ENGLISH_ONLY: Record<string, unknown> = {
  "product copy": PRODUCT_EN_BY_SLUG,
  "journal copy": JOURNAL_EN_BY_SLUG,
  "journal page": JOURNAL_PAGE_EN,
  about: ABOUT_EN,
  "shipping sections": SHIPPING_SECTIONS_EN,
  "contact lead": CONTACT_LEAD_EN,
  "legal notice": LEGAL_NOTICE_EN,
  "legal summaries": LEGAL_SUMMARY_EN,
  "ships within Japan": SHIPS_WITHIN_JAPAN_ONLY,
};

/** Never on the English storefront. */
const FORBIDDEN = [
  /kanemasa\s+phil/i,
  /\belevat(?:e|es|ed|ing)\b/i,
  /\btimeless\b/i,
  /\bluxur(?:y|ious)\b/i,
  /crafted with passion/i,
  // Machine numbers and machine inch sizes are not for customers.
  /\b\d{2}\s?(?:inch|in\.?|″|")\s+(?:machine|cylinder|diameter)/i,
  /machine\s+(?:no\.?|number|#)\s?\d/i,
];

describe("detecting Japanese", () => {
  it("finds kana, kanji, CJK punctuation and full-width forms", () => {
    assert.equal(containsJapanese("Add to bag"), false);
    assert.equal(containsJapanese("¥18,000 (approx. US$117) · 130g/m²"), false);
    assert.equal(containsJapanese("27½ in — “quoted” – 3–7 days"), false);
    assert.equal(containsJapanese("カート"), true);
    assert.equal(containsJapanese("ひらがな"), true);
    assert.equal(containsJapanese("綿"), true);
    assert.equal(containsJapanese("40/2 combed cotton・240g/m²"), true);
    assert.equal(containsJapanese("Total（tax included）"), true);
    assert.equal(containsJapanese("3〜7 days"), true);
    assert.equal(containsJapanese("ｶﾈﾏｻ"), true);
  });

  it("reports the offending run", () => {
    assert.deepEqual(findJapanese("Size サイズ M"), ["サイズ M"]);
    assert.deepEqual(findJapanese("Plain English."), []);
  });

  it("forgives each allow-listed string once per text, not twice", () => {
    const [name, address] = ALLOWED_JAPANESE;

    assert.deepEqual(findJapanese(`Kanemasa Knitting Co., Ltd. ${name}`), []);
    assert.deepEqual(findJapanese(`Address ${address}`), []);
    assert.equal(findJapanese(`${name} and again ${name}`).length, 1);
    // Close is not allowed: only the exact registered name.
    assert.equal(findJapanese("カネマサ莫大小").length, 1);
  });
});

describe("typed dictionaries", () => {
  it("gives Japanese for ja and English for en, in the same shape", () => {
    const getCopy = defineCopy(
      { title: "カート", count: (n: number) => `${n}点` },
      { title: "Bag", count: (n: number) => `${n} items` },
    );

    assert.equal(getCopy("ja").title, "カート");
    assert.equal(getCopy("en").title, "Bag");
    assert.equal(getCopy("en").count(2), "2 items");
  });

  for (const [name, getCopy] of Object.entries(DICTIONARIES)) {
    it(`${name}: English has no Japanese and the same keys as Japanese`, () => {
      const english = getCopy("en");
      const japanese = getCopy("ja");
      const offending = collectStrings(english).flatMap((text) =>
        findJapanese(text, { allow: [] }),
      );

      assert.deepEqual(offending, [], `Japanese left in the English ${name} copy`);
      assert.deepEqual(shapeOf(english), shapeOf(japanese));
    });
  }

  for (const [name, value] of Object.entries(ENGLISH_ONLY)) {
    it(`${name}: no Japanese`, () => {
      const offending = collectStrings(value).flatMap((text) =>
        findJapanese(text, { allow: [] }),
      );

      assert.deepEqual(offending, []);
    });
  }

  it("uses none of the forbidden words or facts in English", () => {
    const english = [
      ...Object.values(DICTIONARIES).map((getCopy) => getCopy("en")),
      ...Object.values(ENGLISH_ONLY),
    ].flatMap((value) => collectStrings(value));

    for (const text of english) {
      for (const pattern of FORBIDDEN) {
        assert.doesNotMatch(text, pattern);
      }
    }
  });
});

/** Key structure of a dictionary; array lengths may differ between languages. */
function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.length > 0 ? [shapeOf(value[0])] : [];
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, shapeOf(item)]),
    );
  }

  return typeof value;
}

describe("English for database content", () => {
  it("has English for all six products", () => {
    for (const { slug } of PRODUCT_CATALOG) {
      assert.ok(PRODUCT_EN_BY_SLUG[slug], `no English for ${slug}`);
    }
  });

  it("localises products without touching name, price, stock or sizes", () => {
    const [japanese] = MOCK_PRODUCTS;
    const [english] = localizeProducts(MOCK_PRODUCTS, "en");

    assert.ok(japanese && english);
    assert.equal(english.name, japanese.name);
    assert.equal(english.price, japanese.price);
    assert.deepEqual(english.variants, japanese.variants);
    assert.deepEqual(english.sizeGuide, japanese.sizeGuide);
    assert.notEqual(english.description, japanese.description);

    for (const product of localizeProducts(MOCK_PRODUCTS, "en")) {
      const text = [
        product.description,
        product.detailDescription,
        product.care,
        product.material,
        ...getFabricSpecRows(product, null, "en").flatMap((row) => [
          row.label,
          row.value,
        ]),
      ].join(" ");

      assert.deepEqual(findJapanese(text, { allow: [] }), [], product.slug);
    }

    assert.equal(localizeProducts(MOCK_PRODUCTS, "ja"), MOCK_PRODUCTS);
  });

  it("shows no Japanese for a product that has no English entry", () => {
    const unknown = { ...MOCK_PRODUCTS[0]!, slug: "new-tee", description: "新しい白。" };
    const [english] = localizeProducts([unknown], "en");

    assert.equal(english!.description, "");
    assert.equal(english!.name, unknown.name);
  });

  it("keeps the three fabrics in English and drops the Japanese helpers", () => {
    const withHelpers = FABRICS.map((fabric) => ({
      ...fabric,
      tagline: "形が立つ、肉厚の白",
      helperJa: "日本語の補足",
      taglineJa: "日本語",
    }));
    const english = localizeFabrics(withHelpers, "en");

    assert.equal(english.length, 3);

    for (const fabric of english) {
      assert.deepEqual(findJapanese(collectStrings(fabric).join(" "), { allow: [] }), []);
    }
  });

  it("has English for the four journal articles and omits any other", () => {
    const stored = [
      ...JOURNAL_ARTICLES,
      {
        ...JOURNAL_ARTICLES[0]!,
        slug: "written-in-the-admin",
        title: "管理画面で書いた記事",
      },
    ];
    const english = localizeJournalArticles(stored, "en");

    assert.equal(english.length, 4);
    assert.ok(!english.some((article) => article.slug === "written-in-the-admin"));
    assert.equal(localizeJournalArticles(stored, "ja").length, 5);

    for (const article of english) {
      assert.deepEqual(
        findJapanese(collectStrings(article).join(" "), { allow: [] }),
        [],
        article.slug,
      );
      // Not language: these still come from the stored entry.
      const original = JOURNAL_ARTICLES.find((item) => item.slug === article.slug)!;
      assert.equal(article.publishedAt, original.publishedAt);
      assert.equal(article.heroImageUrl, original.heroImageUrl);
      assert.equal(article.body.length, original.body.length);
    }
  });
});

describe("business rules stated in English", () => {
  it("says where the store ships, in one fixed sentence", () => {
    assert.equal(SHIPS_WITHIN_JAPAN_ONLY, "We currently ship within Japan only.");
  });

  it("states the same returns window in both languages", () => {
    assert.equal(RETURNS_WINDOW_DAYS, 14);
    assert.match(getReturnsPolicy("ja").returns, /14日/);
    assert.match(getReturnsPolicy("en").returns, /14 days/);
    assert.match(getReturnsPolicy("en").shipping, /¥600/);
    assert.match(getReturnsPolicy("en").shipping, /¥10,000/);
    assert.match(getReturnsPolicy("en").shipping, /3–7 business days/);
  });

  it("puts the Japan-only sentence where an overseas visitor decides", () => {
    const text = (value: unknown) => collectStrings(value).join(" ");

    assert.ok(text(getCheckoutTrustCopy("en")).includes(SHIPS_WITHIN_JAPAN_ONLY));
    assert.ok(text(getStoreGuide("en")).includes(SHIPS_WITHIN_JAPAN_ONLY));
    assert.ok(text(SHIPPING_SECTIONS_EN).includes(SHIPS_WITHIN_JAPAN_ONLY));
    assert.ok(text(getStoreCopy("en").shipping).includes(SHIPS_WITHIN_JAPAN_ONLY));
    assert.ok(text(LEGAL_SUMMARY_EN.legal).includes(SHIPS_WITHIN_JAPAN_ONLY));
    assert.ok(text(getStockistCopy("en")).includes(SHIPS_WITHIN_JAPAN_ONLY));
  });

  it("marks the legal pages as summaries with the Japanese governing", () => {
    assert.equal(
      LEGAL_NOTICE_EN.notice,
      "The Japanese text is the governing version. An English summary is provided for convenience.",
    );
    assert.deepEqual(Object.keys(LEGAL_SUMMARY_EN), ["legal", "privacy", "terms"]);
    assert.match(collectStrings(LEGAL_SUMMARY_EN.legal).join(" "), /Japanese yen/);
    assert.match(collectStrings(LEGAL_SUMMARY_EN.legal).join(" "), /Stripe/);
    assert.match(collectStrings(LEGAL_SUMMARY_EN.legal).join(" "), /14 days/);
  });

  it("romanises the mill's name as given", () => {
    assert.equal(MILL_LEGAL_NAME_EN, "Kanemasa Knitting Co., Ltd.");
  });
});

describe("restock email", () => {
  const input = {
    productName: "46G Regular Tee",
    productSlug: "46g-regular-tee",
    size: "M" as const,
  };

  it("is written in English and links to /en when the request was English", () => {
    const email = buildRestockEmail({ ...input, locale: "en" });

    assert.deepEqual(findJapanese(`${email.subject}\n${email.text}`, { allow: [] }), []);
    assert.match(email.subject, /46G Regular Tee \(M\) is back in stock/);
    assert.match(email.text, /\/en\/products\/46g-regular-tee\?size=M/);
    assert.match(email.text, /once/);
    assert.ok(email.text.includes(SHIPS_WITHIN_JAPAN_ONLY));
  });

  it("stays in Japanese, with unprefixed links, for Japanese requests", () => {
    const email = buildRestockEmail({ ...input, locale: "ja" });

    assert.match(email.subject, /再入荷しました/);
    assert.match(email.text, /\/products\/46g-regular-tee\?size=M/);
    assert.doesNotMatch(email.text, /\/en\//);
  });
});
