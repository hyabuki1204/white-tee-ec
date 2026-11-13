import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDailyCounter, jstDayKey } from "@/lib/concierge/daily-counter";
import { finalizeResult, validateModelOutput } from "@/lib/concierge/finalize";
import { parseConciergeInput } from "@/lib/concierge/input";
import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import {
  buildDynamicSystemPrompt,
  buildOutputSchema,
  buildStaticSystemPrompt,
} from "@/lib/concierge/prompt";
import {
  clientKeyFromHeaders,
  createTokenBucketLimiter,
} from "@/lib/concierge/rate-limit";
import { catalogWithStock } from "@/tests/concierge/helpers";

describe("validateModelOutput", () => {
  const catalog = catalogWithStock();
  const good = {
    reply: "46G Regular Tee の M をおすすめします。",
    primary: {
      productSlug: "46g-regular-tee",
      size: "M",
      reason: "80/1 コーマコンパクト糸、目付130g/m²。",
    },
    alternative: {
      productSlug: "36g-regular-tee",
      size: "M",
      reason: "毎日着るならこちら。",
    },
    followUpQuestion: null,
  };

  it("accepts a well-formed result", () => {
    const result = validateModelOutput(good, catalog);

    assert.equal(result?.primary?.productSlug, "46g-regular-tee");
    assert.equal(result?.alternative?.productSlug, "36g-regular-tee");
  });

  it("rejects non-objects and empty replies", () => {
    assert.equal(validateModelOutput(null, catalog), null);
    assert.equal(validateModelOutput("text", catalog), null);
    assert.equal(validateModelOutput([], catalog), null);
    assert.equal(validateModelOutput({ ...good, reply: "   " }, catalog), null);
    assert.equal(validateModelOutput({ ...good, reply: 42 }, catalog), null);
  });

  it("drops a recommendation for a product that does not exist", () => {
    const result = validateModelOutput(
      {
        ...good,
        primary: { productSlug: "60g-silk-tee", size: "M", reason: "x" },
        alternative: null,
      },
      catalog,
    );

    assert.equal(result?.primary, null);
    assert.equal(result?.alternative, null);
  });

  it("promotes a valid alternative when the primary is invalid", () => {
    const result = validateModelOutput(
      { ...good, primary: { productSlug: "nope", size: "M", reason: "x" } },
      catalog,
    );

    assert.equal(result?.primary?.productSlug, "36g-regular-tee");
    assert.equal(result?.alternative, null);
  });

  it("turns a size the product is not sold in into no size", () => {
    for (const size of ["XL", "XXL", "42", 3, undefined]) {
      const result = validateModelOutput(
        { ...good, primary: { ...good.primary, size } },
        catalog,
      );

      assert.equal(result?.primary?.size, null, String(size));
    }
  });

  it("drops an alternative identical to the primary", () => {
    const result = validateModelOutput(
      { ...good, alternative: { ...good.primary } },
      catalog,
    );

    assert.equal(result?.alternative, null);
  });

  it("caps over-long text", () => {
    const result = validateModelOutput(
      { ...good, reply: "あ".repeat(5_000) },
      catalog,
    );

    assert.equal(result?.reply.length, CONCIERGE_LIMITS.maxReplyChars);
  });

  it("rejects the whole output when it contains words the store never prints", () => {
    for (const reply of [
      "KANEMASA PHIL. と同じ生地です。",
      "目付は仮の数値です。",
      "3号機で編んでいます。",
      "30インチの編機で編んでいます。",
      "詳しくは https://example.com へ。",
    ]) {
      assert.equal(validateModelOutput({ ...good, reply }, catalog), null, reply);
    }

    assert.equal(
      validateModelOutput(
        { ...good, primary: { ...good.primary, reason: "仮の目付です。" } },
        catalog,
      ),
      null,
    );
  });

  it("keeps the store's own needle-density wording", () => {
    const result = validateModelOutput(
      { ...good, reply: "1インチに針46本の密度です。" },
      catalog,
    );

    assert.ok(result);
  });
});

describe("finalizeResult on model output", () => {
  it("overwrites a sold-out pick and its reply", () => {
    const catalog = catalogWithStock({ "46g-regular-tee": { M: 0 } });
    const raw = validateModelOutput(
      {
        reply: "46G Regular Tee の M をおすすめします。",
        primary: { productSlug: "46g-regular-tee", size: "M", reason: "薄手です。" },
        alternative: null,
        followUpQuestion: null,
      },
      catalog,
    );

    assert.ok(raw);

    const reply = finalizeResult(raw, catalog, "ja");

    assert.equal(reply.primary?.size, "L");
    assert.equal(reply.primary?.stock, "in_stock");
    assert.match(reply.reply, /M は現在在庫切れ/);
    assert.doesNotMatch(reply.reply, /M をおすすめ/);
  });

  it("links only to allow-listed paths mentioned in the reply", () => {
    const catalog = catalogWithStock();
    const reply = finalizeResult(
      {
        reply: "詳しくは /store-guide か /contact をご覧ください。/admin は対象外です。",
        primary: null,
        alternative: null,
        followUpQuestion: null,
      },
      catalog,
      "ja",
    );

    assert.deepEqual(
      reply.links.map((item) => item.href),
      ["/store-guide", "/contact"],
    );
  });
});

describe("parseConciergeInput", () => {
  const user = (content: string) => ({ role: "user", content });

  it("accepts a normal conversation", () => {
    const parsed = parseConciergeInput({
      messages: [
        user("身長170cm"),
        { role: "assistant", content: "36G Regular Tee の M をおすすめします。" },
        user("ゆったり着たい"),
      ],
      contextSlug: "36g-regular-tee",
    });

    assert.equal(parsed.ok, true);
    assert.equal(parsed.ok && parsed.messages.length, 3);
    assert.equal(parsed.ok && parsed.contextSlug, "36g-regular-tee");
  });

  it("rejects malformed bodies", () => {
    for (const body of [
      null,
      "x",
      {},
      { messages: [] },
      { messages: "hi" },
      { messages: [{ role: "system", content: "x" }] },
      { messages: [{ role: "user", content: 5 }] },
      { messages: [user("   ")] },
      { messages: [{ role: "assistant", content: "x" }] },
      { messages: Array.from({ length: 25 }, () => user("a")) },
    ]) {
      const parsed = parseConciergeInput(body);

      assert.equal(parsed.ok, false, JSON.stringify(body)?.slice(0, 60));
    }
  });

  it("rejects an over-long message instead of truncating it", () => {
    const parsed = parseConciergeInput({
      messages: [user("あ".repeat(CONCIERGE_LIMITS.maxMessageChars + 1))],
    });

    assert.deepEqual(parsed, { ok: false, error: "message_too_long" });
  });

  it("keeps only the most recent turns, within the character cap", () => {
    const messages = Array.from({ length: 24 }, (_, index) =>
      index % 2 === 0
        ? user(`${index}:` + "x".repeat(450))
        : { role: "assistant", content: "y".repeat(2_000) },
    );
    messages.push(user("最後の質問"));
    messages.shift();

    const parsed = parseConciergeInput({ messages });

    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;

    const total = parsed.messages.reduce((sum, turn) => sum + turn.content.length, 0);

    assert.ok(parsed.messages.length <= CONCIERGE_LIMITS.maxTurnsKept);
    assert.ok(total <= CONCIERGE_LIMITS.maxTotalChars);
    assert.equal(parsed.messages[0].role, "user");
    assert.equal(parsed.messages.at(-1)?.content, "最後の質問");
    assert.ok(
      parsed.messages.every(
        (turn) => turn.content.length <= CONCIERGE_LIMITS.maxAssistantChars,
      ),
    );
  });

  it("ignores a context slug that is not slug-shaped", () => {
    const parsed = parseConciergeInput({
      messages: [user("サイズ")],
      contextSlug: "../../etc/passwd",
    });

    assert.equal(parsed.ok && parsed.contextSlug, null);
  });
});

describe("token bucket limiter", () => {
  it("allows a burst, then refuses with a retry time", () => {
    const limiter = createTokenBucketLimiter({
      burst: 3,
      refillMs: 10_000,
      maxKeys: 10,
      now: () => 0,
    });

    assert.equal(limiter.take("a").allowed, true);
    assert.equal(limiter.take("a").allowed, true);
    assert.equal(limiter.take("a").allowed, true);

    const refused = limiter.take("a");

    assert.equal(refused.allowed, false);
    assert.equal(!refused.allowed && refused.retryAfterSeconds, 10);
  });

  it("refills one token per interval, up to the burst", () => {
    let time = 0;
    const limiter = createTokenBucketLimiter({
      burst: 2,
      refillMs: 1_000,
      maxKeys: 10,
      now: () => time,
    });

    limiter.take("a");
    limiter.take("a");
    assert.equal(limiter.take("a").allowed, false);

    time += 1_000;
    assert.equal(limiter.take("a").allowed, true);
    assert.equal(limiter.take("a").allowed, false);

    time += 60_000;
    assert.equal(limiter.take("a").allowed, true);
    assert.equal(limiter.take("a").allowed, true);
    assert.equal(limiter.take("a").allowed, false);
  });

  it("keeps separate buckets per key", () => {
    const limiter = createTokenBucketLimiter({
      burst: 1,
      refillMs: 1_000,
      maxKeys: 10,
      now: () => 0,
    });

    assert.equal(limiter.take("a").allowed, true);
    assert.equal(limiter.take("a").allowed, false);
    assert.equal(limiter.take("b").allowed, true);
  });

  it("refused requests do not push the retry time further out", () => {
    let time = 0;
    const limiter = createTokenBucketLimiter({
      burst: 1,
      refillMs: 1_000,
      maxKeys: 10,
      now: () => time,
    });

    limiter.take("a");

    for (let attempt = 0; attempt < 50; attempt += 1) {
      time += 10;
      limiter.take("a");
    }

    time = 1_000;
    assert.equal(limiter.take("a").allowed, true);
  });

  it("evicts the least recently used key past the cap", () => {
    const limiter = createTokenBucketLimiter({
      burst: 1,
      refillMs: 1_000_000,
      maxKeys: 2,
      now: () => 0,
    });

    limiter.take("a");
    limiter.take("b");
    limiter.take("a");
    limiter.take("c");

    assert.equal(limiter.size(), 2);
    // "b" was evicted and starts fresh; "a" is still remembered as empty.
    assert.equal(limiter.take("a").allowed, false);
  });

  it("derives a bounded key from proxy headers", () => {
    assert.equal(
      clientKeyFromHeaders(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })),
      "203.0.113.7",
    );
    assert.equal(clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.2" })), "198.51.100.2");
    assert.equal(clientKeyFromHeaders(new Headers()), "unknown");
    assert.equal(
      clientKeyFromHeaders(new Headers({ "x-forwarded-for": "x".repeat(500) })),
      "unknown",
    );
  });
});

describe("daily counter", () => {
  it("stops at the limit and resets on the next JST day", () => {
    // 2026-11-13 14:59 UTC = 23:59 JST
    let time = Date.UTC(2026, 10, 13, 14, 59);
    const counter = createDailyCounter(() => time);

    assert.equal(counter.tryConsume(2), true);
    assert.equal(counter.tryConsume(2), true);
    assert.equal(counter.tryConsume(2), false);
    assert.equal(counter.used(), 2);

    time += 2 * 60 * 1000; // 00:01 JST the next day
    assert.equal(counter.used(), 0);
    assert.equal(counter.tryConsume(2), true);
  });

  it("treats a zero limit as closed", () => {
    assert.equal(createDailyCounter(() => 0).tryConsume(0), false);
  });

  it("keys days in Japan time", () => {
    assert.equal(jstDayKey(Date.UTC(2026, 10, 13, 14, 59)), "2026-11-13");
    assert.equal(jstDayKey(Date.UTC(2026, 10, 13, 15, 0)), "2026-11-14");
  });
});

describe("system prompt", () => {
  const catalog = catalogWithStock();

  it("is byte-stable across calls, so the cache prefix can hit", () => {
    assert.equal(buildStaticSystemPrompt(catalog), buildStaticSystemPrompt(catalog));
  });

  it("does not change when only stock changes", () => {
    const moved = catalogWithStock({ "36g-regular-tee": { M: 0 } });

    assert.equal(buildStaticSystemPrompt(catalog), buildStaticSystemPrompt(moved));
    assert.notEqual(
      buildDynamicSystemPrompt(catalog, null),
      buildDynamicSystemPrompt(moved, null),
    );
    assert.match(buildDynamicSystemPrompt(moved, null), /36g-regular-tee: S=10, M=0, L=10/);
  });

  it("carries the whole catalog, specs, size guides and policy", () => {
    const prompt = buildStaticSystemPrompt(catalog);

    for (const entry of catalog.entries) {
      assert.ok(prompt.includes(entry.product.slug));
    }

    for (const expected of [
      "40/2 コーマ糸",
      "240 g/m²",
      "160 g/m²",
      "130 g/m²",
      "length 70, shoulder 46, chest 54, sleeve 21",
      "length 67, shoulder 54, chest 60, sleeve 24",
      "165–175cm",
      "MACHINE WASH COLD",
      "3〜7営業日",
      "14日以内",
      "/store-guide",
      "/contact",
    ]) {
      assert.ok(prompt.includes(expected), expected);
    }
  });

  it("contains none of the words the store never prints", () => {
    const prompt =
      buildStaticSystemPrompt(catalog) +
      buildDynamicSystemPrompt(catalog, "46g-box-tee");

    assert.doesNotMatch(prompt, /KANEMASA|カネマサ|仮|号機/i);
  });

  it("restricts productSlug to the live catalog", () => {
    const schema = buildOutputSchema(catalog) as {
      properties: {
        primary: { anyOf: Array<{ properties?: { productSlug: { enum: string[] } } }> };
      };
    };

    assert.deepEqual(
      schema.properties.primary.anyOf[0].properties?.productSlug.enum,
      catalog.entries.map((entry) => entry.product.slug),
    );
  });
});
