import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/cart/shipping";
import {
  findEntry,
  measurementOf,
  siblingOf,
  type CatalogEntry,
  type ConciergeCatalog,
} from "@/lib/concierge/catalog";
import {
  detectLanguage,
  GAUGES,
  mergeSignals,
  readMessage,
  TAG_VOTES,
  type GaugeTag,
  type Signals,
} from "@/lib/concierge/signals";
import type {
  ConciergeLanguage,
  ConciergeLink,
  ConciergeTurn,
  RawConciergeResult,
  RawRecommendation,
} from "@/lib/concierge/types";
import { shiftSize } from "@/lib/products/fit-profiles";
import { recommendSize } from "@/lib/products/size-recommendation";
import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";
import type { ProductSize } from "@/types";

/**
 * Deterministic recommender.
 *
 * Answers when no API key is configured, when the model call fails or is
 * declined, and when the daily budget is spent. It returns the same shape as
 * the model path, and every sentence it writes is assembled from catalog
 * data: gauge specs, size guides, height bands and the store's policy copy.
 *
 * Gauge rules: worn alone / wants structure / worried about sheerness → 28G;
 * everyday / unsure / first tee → 36G; under a jacket / wants drape / hot
 * weather → 46G. Roomy → Box. Size comes from recommendSize().
 */

export type RulesOutcome = {
  result: RawConciergeResult;
  links: ConciergeLink[];
  language: ConciergeLanguage;
};

const DEFAULT_GAUGE = 36;

const LINKS = {
  guide: { ja: "ご利用ガイド", en: "Store guide", href: "/store-guide" },
  shipping: {
    ja: RETURNS_POLICY.shippingLink,
    en: "Shipping & returns",
    href: "/shipping",
  },
  contact: { ja: "お問い合わせ", en: "Contact", href: "/contact" },
} as const;

function link(key: keyof typeof LINKS, language: ConciergeLanguage): ConciergeLink {
  return { href: LINKS[key].href, label: LINKS[key][language] };
}

function yen(amount: number): string {
  return `¥${amount.toLocaleString("en-US")}`;
}

/** English rendering of the mill's yarn notation; null if it cannot be mapped. */
function yarnEn(yarn: string): string | null {
  const mapped = yarn
    .replace("コーマコンパクト糸", "combed compact yarn")
    .replace("コンパクト糸", "compact yarn")
    .replace("コーマ糸", "combed yarn");

  return /^[\x20-\x7e]+$/.test(mapped) ? mapped : null;
}

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------

type GaugeChoice = {
  gauge: number;
  /** True when the customer or the page they came from fixed the gauge. */
  fixed: boolean;
  /** Second-best gauge by the customer's own signals, if any. */
  runnerUp: number | null;
  /** True when at least one signal argued for a gauge. */
  grounded: boolean;
};

export function chooseGauge(
  signals: Signals,
  available: number[],
  contextGauge: number | null,
): GaugeChoice {
  const pool = available.filter(
    (gauge) => !(signals.ownedGauge === gauge && available.length > 1),
  );
  const votes = new Map<number, number>(pool.map((gauge) => [gauge, 0]));

  for (const tag of signals.tags) {
    const { gauge, weight } = TAG_VOTES[tag];
    if (votes.has(gauge)) votes.set(gauge, (votes.get(gauge) ?? 0) + weight);
  }

  const ranked = [...votes.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1] || a[0] - b[0]);

  if (signals.wantedGauge !== undefined && pool.includes(signals.wantedGauge)) {
    return {
      gauge: signals.wantedGauge,
      fixed: true,
      runnerUp: ranked.find(([gauge]) => gauge !== signals.wantedGauge)?.[0] ?? null,
      grounded: true,
    };
  }

  if (ranked.length === 0) {
    if (contextGauge !== null && pool.includes(contextGauge)) {
      return { gauge: contextGauge, fixed: true, runnerUp: null, grounded: true };
    }

    // Owning the default and wanting another: offer the far end of the ladder.
    const fallback = pool.includes(DEFAULT_GAUGE)
      ? DEFAULT_GAUGE
      : (pool[pool.length - 1] ?? DEFAULT_GAUGE);

    return {
      gauge: fallback,
      fixed: false,
      runnerUp: null,
      grounded: signals.ownedGauge !== undefined,
    };
  }

  const [top, second] = ranked;
  const tied = second !== undefined && second[1] === top[1];

  if (tied) {
    const tiedGauges = ranked
      .filter(([, score]) => score === top[1])
      .map(([gauge]) => gauge);
    const middle = pool.includes(DEFAULT_GAUGE) ? DEFAULT_GAUGE : null;

    // Heavy and light pulling equally: the middle gauge, with the heavier
    // one as the alternative. A tie that involves the middle gauge goes to
    // the more specific signal instead.
    if (middle !== null && !tiedGauges.includes(middle)) {
      return { gauge: middle, fixed: false, runnerUp: tiedGauges[0], grounded: true };
    }

    const specific = tiedGauges.find((gauge) => gauge !== middle) ?? top[0];

    return {
      gauge: specific,
      fixed: false,
      runnerUp: tiedGauges.find((gauge) => gauge !== specific) ?? null,
      grounded: true,
    };
  }

  return { gauge: top[0], fixed: false, runnerUp: second?.[0] ?? null, grounded: true };
}

function defaultAlternativeGauge(gauge: number, available: number[]): number | null {
  const preferred = gauge === DEFAULT_GAUGE ? [28, 46] : [DEFAULT_GAUGE, 28, 46];
  return preferred.find((other) => other !== gauge && available.includes(other)) ?? null;
}

function weightRank(
  entry: CatalogEntry,
  catalog: ConciergeCatalog,
): { rank: "heaviest" | "lightest" | "middle"; count: number } {
  const weights = [
    ...new Set(
      catalog.entries
        .map((other) => other.spec?.weightGsm)
        .filter((weight): weight is number => weight !== undefined),
    ),
  ];
  const own = entry.spec?.weightGsm ?? 0;

  if (weights.length > 1 && own === Math.max(...weights)) {
    return { rank: "heaviest", count: weights.length };
  }
  if (weights.length > 1 && own === Math.min(...weights)) {
    return { rank: "lightest", count: weights.length };
  }
  return { rank: "middle", count: weights.length };
}

const CLAUSE_PRIORITY: GaugeTag[] = ["sheer", "alone", "jacket", "drape"];

function gaugeSentence(
  entry: CatalogEntry,
  catalog: ConciergeCatalog,
  tags: GaugeTag[],
  language: ConciergeLanguage,
): string {
  const { spec } = entry;
  if (!spec) return "";

  const { rank, count } = weightRank(entry, catalog);
  const clauseTag = CLAUSE_PRIORITY.find(
    (tag) => tags.includes(tag) && TAG_VOTES[tag].gauge === spec.gauge,
  );

  if (language === "en") {
    const yarn = yarnEn(spec.yarn);
    const rankText =
      rank === "heaviest"
        ? `the heaviest of the ${count} gauges`
        : rank === "lightest"
          ? `the lightest of the ${count} gauges`
          : `the middle weight of the ${count} gauges`;
    const clause =
      clauseTag === "sheer"
        ? ", and resists show-through"
        : clauseTag === "alone"
          ? ", made to be worn on its own"
          : clauseTag === "jacket"
            ? ", and sits cleanly under a jacket"
            : clauseTag === "drape"
              ? ", and drapes like a woven with a restrained sheen"
              : "";

    return `${spec.gauge}G is ${yarn ? `${yarn} at ` : ""}${spec.weightGsm} g/m², ${rankText}${clause}.`;
  }

  const rankText =
    rank === "heaviest"
      ? `${count}ゲージのうち最も厚い`
      : rank === "lightest"
        ? `${count}ゲージのうち最も薄い`
        : `${count}ゲージの中間の厚みで、一年を通して着られる`;
  const clause =
    clauseTag === "sheer"
      ? "、透けにくい"
      : clauseTag === "alone"
        ? "、一枚で着るための"
        : clauseTag === "jacket"
          ? "、ジャケットの下に収まる"
          : clauseTag === "drape"
            ? "、布帛のような落ち感が出る"
            : "";

  return `${spec.gauge}Gは${spec.yarn}・目付${spec.weightGsm}g/m²で、${rankText}${clause}生地です。`;
}

function alternativeGaugeReason(
  entry: CatalogEntry,
  language: ConciergeLanguage,
): string {
  const gauge = entry.spec?.gauge;
  const weight = entry.spec?.weightGsm;

  if (language === "en") {
    if (gauge === 28) {
      return `Better if you mostly wear it on its own and want the most weight (${weight} g/m²) and the least show-through.`;
    }
    if (gauge === 46) {
      return `Better if it goes under a jacket, or if you want the thinnest fabric (${weight} g/m²).`;
    }
    return `Better if you want one tee for every season (${weight} g/m²).`;
  }

  if (gauge === 28) {
    return `一枚で着ることが多く、厚み（${weight}g/m²）と透けにくさを優先するなら、こちらです。`;
  }
  if (gauge === 46) {
    return `ジャケットの下に着る、または薄さ（${weight}g/m²）を優先するなら、こちらです。`;
  }
  return `季節を問わず毎日着る一枚にするなら（${weight}g/m²）、こちらです。`;
}

function silhouetteDelta(
  box: CatalogEntry,
  regular: CatalogEntry,
  size: ProductSize | null,
): { chest: number; length: number } | null {
  const reference = size ?? "M";
  const boxRow = measurementOf(box, reference);
  const regularRow = measurementOf(regular, reference);

  if (!boxRow || !regularRow) return null;

  return {
    chest: boxRow.chest - regularRow.chest,
    length: regularRow.length - boxRow.length,
  };
}

function alternativeSilhouetteReason(
  entry: CatalogEntry,
  catalog: ConciergeCatalog,
  size: ProductSize | null,
  language: ConciergeLanguage,
): string {
  const sibling = siblingOf(catalog, entry);
  const box = entry.silhouette === "Box" ? entry : sibling;
  const regular = entry.silhouette === "Box" ? sibling : entry;
  const delta = box && regular ? silhouetteDelta(box, regular, size) : null;

  if (entry.silhouette === "Box") {
    if (language === "en") {
      return delta
        ? `Better if you want it roomier: ${delta.chest} cm wider in the chest and ${delta.length} cm shorter than Regular.`
        : "Better if you want it roomier.";
    }
    return delta
      ? `同じゲージでゆったり着るなら、こちらです。Regularより身幅が${delta.chest}cm広く、着丈が${delta.length}cm短い形です。`
      : "同じゲージでゆったり着るなら、こちらです。";
  }

  if (language === "en") {
    return delta
      ? `Better if you want a standard shape: ${delta.chest} cm narrower in the chest and ${delta.length} cm longer than Box.`
      : "Better if you want a standard shape.";
  }
  return delta
    ? `同じゲージで標準的な形にするなら、こちらです。Boxより身幅が${delta.chest}cm狭く、着丈が${delta.length}cm長い形です。`
    : "同じゲージで標準的な形にするなら、こちらです。";
}

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

type SizeChoice = {
  size: ProductSize | null;
  /** One sentence: why this size, and what it measures. Empty without a size. */
  sentence: string;
};

export function chooseSize(
  signals: Signals,
  entry: CatalogEntry,
  language: ConciergeLanguage,
): SizeChoice {
  const { sizes } = entry;
  const en = language === "en";
  let size: ProductSize | null = null;
  // Japanese clauses are kept in connective form (…で / …おり) so the
  // measurement can follow in the same sentence. `stem` is the same fact in
  // a form that a "but one size up" clause can be attached to.
  let basis = "";
  let stem = "";

  if (signals.heightCm !== undefined) {
    // "just-fit" on purpose: roominess is expressed by the Box silhouette,
    // whose extra width is in the pattern, not by sizing up.
    const result = recommendSize(
      {
        heightCm: signals.heightCm,
        weightKg: signals.weightKg ?? 0,
        preference: "just-fit",
      },
      entry.product.fitProfile,
      sizes,
    );

    size = result?.recommended ?? null;

    if (size) {
      const label = entry.product.fitProfile.sizeReference.find(
        (row) => row.size === size,
      )?.heightLabel;

      basis = en
        ? `For ${signals.heightCm} cm the guide size is ${size}${label ? ` (${label})` : ""}`
        : `身長${signals.heightCm}cmの目安は${size}${label ? `（${label}）` : ""}で`;
      stem = en
        ? basis
        : `身長${signals.heightCm}cmの目安は${size}${label ? `（${label}）` : ""}です`;
    }
  } else if (signals.usualSize) {
    const largest = sizes[sizes.length - 1];

    if (sizes.includes(signals.usualSize as ProductSize)) {
      size = signals.usualSize as ProductSize;
      basis = en ? `Sized to your usual ${size}` : `普段の${size}に合わせており`;
      stem = en ? `You usually wear ${size}` : `普段は${size}とのことです`;
    } else if (largest) {
      size = largest;
      basis = en
        ? `You usually wear ${signals.usualSize}, and ${largest} is the largest size made`
        : `普段は${signals.usualSize}とのことですが展開は${largest}までで`;
    }
  }

  if (!size) return { size: null, sentence: "" };

  if (signals.solidBuild) {
    const up = shiftSize(size, 1, sizes);

    if (up !== size && stem) {
      size = up;
      basis = en
        ? `${stem}, taken one size up to ${up} for a broader build`
        : `${stem}が、がっしりした体格とのことなので1サイズ上の${up}にしており`;
    }
  }

  const row = measurementOf(entry, size);
  const measure = en
    ? row
      ? `; ${entry.silhouette} ${size} measures ${row.chest} cm across the chest and ${row.length} cm in length`
      : ""
    : row
      ? `、${entry.silhouette} ${size}は身幅${row.chest}cm・着丈${row.length}cmです`
      : `、${entry.silhouette} ${size}をご案内します`;

  return { size, sentence: en ? `${basis}${measure}.` : `${basis}${measure}。` };
}

// ---------------------------------------------------------------------------
// Fixed replies
// ---------------------------------------------------------------------------

function declineReply(language: ConciergeLanguage): string {
  return language === "en"
    ? "I can only help with choosing a tee: gauge, silhouette, size, fabric, care, shipping and returns. Tell me your height and how you plan to wear it, and I will suggest one."
    : "Tシャツ選び（ゲージ・シルエット・サイズ・生地・お手入れ・配送と返品）以外のご質問にはお答えできません。身長と着方を教えていただければ、一枚をご提案します。";
}

function greetingReply(language: ConciergeLanguage): string {
  return language === "en"
    ? "Hello. Tell me your height (or usual size) and how you want to wear the tee — on its own, under a jacket — and I will suggest one."
    : "こんにちは。身長（または普段のサイズ）と、どう着たいか（一枚で、ジャケットの下に、など）を教えてください。一枚をご提案します。";
}

function thanksReply(language: ConciergeLanguage): string {
  return language === "en"
    ? "You're welcome. Ask again any time about size or fabric."
    : "ありがとうございます。サイズや生地について、また気になることがあればどうぞ。";
}

function shippingReply(language: ConciergeLanguage): string {
  if (language === "ja") return RETURNS_POLICY.shipping;

  const days = RETURNS_POLICY.shipping.match(/(\d+)\s*[〜~–-]\s*(\d+)\s*営業日/);
  const dispatch = days
    ? `Orders ship within ${days[1]}–${days[2]} business days of confirmation. `
    : "";

  return `${dispatch}Shipping within Japan is a flat ${yen(SHIPPING_FEE)} (tax included), and free on orders of ${yen(FREE_SHIPPING_THRESHOLD)} or more.`;
}

function returnsReply(language: ConciergeLanguage): string {
  return language === "en"
    ? `Unworn items with tags attached can be returned within ${RETURNS_POLICY.windowDays} days of arrival. You can try it on at home; contact us to arrange the return.`
    : RETURNS_POLICY.returns;
}

function careReply(care: string, language: ConciergeLanguage): string {
  return language === "en"
    ? `The care label reads: ${care} For anything beyond the label, please contact us.`
    : `お手入れ表示は次のとおりです。${care} 表示にないお手入れについては、お問い合わせください。`;
}

function compareReply(
  catalog: ConciergeCatalog,
  language: ConciergeLanguage,
): string {
  const seen = new Set<number>();
  const lines: string[] = [];

  for (const entry of catalog.entries) {
    const { spec } = entry;
    if (!spec || seen.has(spec.gauge)) continue;
    seen.add(spec.gauge);

    if (language === "en") {
      const yarn = yarnEn(spec.yarn);
      lines.push(
        `${spec.gauge}G (${spec.character}): ${yarn ? `${yarn}, ` : ""}${spec.weightGsm} g/m².`,
      );
    } else {
      lines.push(
        `${spec.gauge}G：${spec.yarn}、目付${spec.weightGsm}g/m²。${spec.headlineJa}`,
      );
    }
  }

  const lead =
    language === "en"
      ? "Gauge is the number of needles per inch. A higher number means a finer, thinner, denser knit."
      : "ゲージは1インチあたりの針の本数です。数字が大きいほど編目は細かく、生地は薄く、密になります。";

  return [lead, ...lines].join("\n");
}

function usageQuestion(language: ConciergeLanguage): string {
  return language === "en"
    ? "Will you wear it on its own, or under a jacket?"
    : "一枚で着ますか、それともジャケットの下に着ますか。";
}

function sizeQuestion(language: ConciergeLanguage): string {
  return language === "en"
    ? "What is your height in cm, or your usual T-shirt size? I will add a size."
    : "身長（cm）か、普段のTシャツのサイズを教えてください。サイズをお出しします。";
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function recommendByRules(input: {
  messages: ConciergeTurn[];
  catalog: ConciergeCatalog;
  contextSlug?: string | null;
}): RulesOutcome {
  const { catalog } = input;
  const userTexts = input.messages
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content);
  const lastText = userTexts[userTexts.length - 1] ?? "";
  const language = detectLanguage(lastText);
  const readings = userTexts.map(readMessage);
  const last = readings[readings.length - 1];
  const context = input.contextSlug
    ? (catalog.bySlug.get(input.contextSlug) ?? null)
    : null;

  const plain = (
    reply: string,
    links: ConciergeLink[] = [],
    followUpQuestion: string | null = null,
  ): RulesOutcome => ({
    result: { reply, primary: null, alternative: null, followUpQuestion },
    links,
    language,
  });

  if (!last || catalog.entries.length === 0) {
    return plain(declineReply(language), [link("contact", language)]);
  }

  if (!last.onTopic) {
    if (last.topics.includes("thanks")) return plain(thanksReply(language));
    if (last.topics.includes("greeting")) return plain(greetingReply(language));

    return plain(declineReply(language));
  }

  const lastHasBody =
    last.signals.heightCm !== undefined ||
    last.signals.usualSize !== undefined ||
    last.signals.tags.length > 0 ||
    last.signals.fit !== undefined;

  if (last.topics.includes("compare")) {
    return plain(compareReply(catalog, language), [], usageQuestion(language));
  }

  if (!lastHasBody) {
    const parts: string[] = [];
    const links: ConciergeLink[] = [];

    if (last.topics.includes("shipping")) {
      parts.push(shippingReply(language));
      links.push(link("shipping", language), link("guide", language));
    }
    if (last.topics.includes("returns")) {
      parts.push(returnsReply(language));
      links.push(link("shipping", language), link("contact", language));
    }
    if (last.topics.includes("care")) {
      const care = (context ?? catalog.entries[0]).product.care.trim();
      parts.push(careReply(care, language));
      links.push(link("contact", language));
    }

    if (parts.length > 0) {
      const unique = links.filter(
        (item, index) => links.findIndex((other) => other.href === item.href) === index,
      );
      return plain(parts.join("\n"), unique);
    }
  }

  const signals = mergeSignals(readings.map((reading) => reading.signals));
  const availableGauges = GAUGES.filter((gauge) =>
    catalog.entries.some((entry) => entry.spec?.gauge === gauge),
  );
  const gaugeChoice = chooseGauge(
    signals,
    [...availableGauges],
    context?.spec?.gauge ?? null,
  );

  const wantedSilhouette: "Regular" | "Box" =
    signals.silhouette ??
    (signals.fit === "roomy"
      ? "Box"
      : signals.fit === "fitted"
        ? "Regular"
        : (context?.silhouette ?? "Regular"));

  const entry =
    findEntry(catalog, gaugeChoice.gauge, wantedSilhouette) ??
    findEntry(catalog, gaugeChoice.gauge, "Regular") ??
    findEntry(catalog, gaugeChoice.gauge, "Box") ??
    catalog.entries[0];

  const sizeChoice = chooseSize(signals, entry, language);
  const sibling = siblingOf(catalog, entry);

  const reasonParts = [
    gaugeSentence(entry, catalog, signals.tags, language),
    sizeChoice.sentence,
  ];

  if (signals.fit === "roomy" && entry.silhouette === "Box" && sibling) {
    const delta = silhouetteDelta(entry, sibling, sizeChoice.size);

    if (delta) {
      reasonParts.push(
        language === "en"
          ? `Box is ${delta.chest} cm wider in the chest than Regular, so it wears roomy at your normal size.`
          : `ゆったり着たいとのことなので、Regularより身幅が${delta.chest}cm広いBoxにしています。`,
      );
    }
  }

  const primary: RawRecommendation = {
    productSlug: entry.product.slug,
    size: sizeChoice.size,
    reason: reasonParts.filter(Boolean).join(language === "en" ? " " : ""),
  };

  // Alternative: when the gauge was fixed by the customer the open question
  // is the silhouette; otherwise it is the next gauge.
  let alternative: RawRecommendation | null = null;
  const alternativeGauge =
    gaugeChoice.runnerUp ??
    (gaugeChoice.fixed
      ? null
      : defaultAlternativeGauge(
          gaugeChoice.gauge,
          availableGauges.filter((gauge) => gauge !== signals.ownedGauge),
        ));
  const alternativeEntry =
    alternativeGauge !== null
      ? findEntry(catalog, alternativeGauge, entry.silhouette)
      : undefined;

  if (alternativeEntry && alternativeEntry !== entry) {
    alternative = {
      productSlug: alternativeEntry.product.slug,
      size:
        sizeChoice.size && alternativeEntry.sizes.includes(sizeChoice.size)
          ? sizeChoice.size
          : null,
      reason: alternativeGaugeReason(alternativeEntry, language),
    };
  } else if (sibling) {
    alternative = {
      productSlug: sibling.product.slug,
      size:
        sizeChoice.size && sibling.sizes.includes(sizeChoice.size)
          ? sizeChoice.size
          : null,
      reason: alternativeSilhouetteReason(sibling, catalog, sizeChoice.size, language),
    };
  }

  const name = entry.product.name;
  const reply =
    language === "en"
      ? sizeChoice.size
        ? `I recommend the ${name} in size ${sizeChoice.size}.`
        : `I recommend the ${name}.`
      : sizeChoice.size
        ? `${name} の ${sizeChoice.size} をおすすめします。`
        : `${name} をおすすめします。`;

  const followUpQuestion =
    sizeChoice.size === null
      ? sizeQuestion(language)
      : gaugeChoice.grounded
        ? null
        : usageQuestion(language);

  return {
    result: { reply, primary, alternative, followUpQuestion },
    links: [],
    language,
  };
}
