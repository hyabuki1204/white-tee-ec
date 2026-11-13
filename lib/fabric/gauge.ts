import type { Locale } from "@/lib/i18n/config";
import type { Localized } from "@/lib/i18n/define-copy";

/**
 * Gauge = needles per inch on the knitting machine. The whole store is
 * organised around this number, so every fabric carries one.
 */
type GaugeCopy = {
  /** Yarn count as written on the mill's spec sheet. */
  yarn: string;
  /** Knit structure. */
  structure: string;
  /** Headline for the gauge. */
  headline: string;
  /** Two or three lines describing hand and use. */
  lines: readonly string[];
};

type GaugeFacts = {
  gauge: number;
  /** Finished fabric weight in g/m². */
  weightGsm: number;
  /** One-word English character, shown beside the numeral. */
  character: string;
};

export type GaugeSpec = GaugeFacts & GaugeCopy;

type GaugeEntry = GaugeFacts & { copy: Localized<GaugeCopy> };

const STRUCTURE: Localized<string> = {
  ja: "度詰天竺",
  en: "Tight-knit jersey",
};

/**
 * 46G weight comes from the mill's finished-fabric master. 28G and 36G
 * weights are provisional until the white-tee lots are finished and measured.
 */
const GAUGE_ENTRY_BY_FABRIC_SLUG: Record<string, GaugeEntry> = {
  "28g-jersey": {
    gauge: 28,
    weightGsm: 240,
    character: "Heavy",
    copy: {
      ja: {
        yarn: "40/2 コーマ糸",
        structure: STRUCTURE.ja,
        headline: "形が立つ、肉厚の白。",
        lines: [
          "双糸を28ゲージで詰めて編んだ、厚みとハリのある天竺。",
          "透けにくく、洗っても首元と肩線が崩れにくい。",
          "一枚で着るための白です。",
        ],
      },
      en: {
        yarn: "40/2 combed cotton",
        structure: STRUCTURE.en,
        headline: "A thick white that holds its shape.",
        lines: [
          "Two-ply yarn, knitted tight at 28 gauge. A jersey with thickness and body.",
          "Hard to see through. The collar and shoulder line stay put through washing.",
          "A white to wear on its own.",
        ],
      },
    },
  },
  "36g-jersey": {
    gauge: 36,
    weightGsm: 160,
    character: "Standard",
    copy: {
      ja: {
        yarn: "60/1 コンパクト糸",
        structure: STRUCTURE.ja,
        headline: "毎日着る、基準の白。",
        lines: [
          "毛羽の少ないコンパクト糸を36ゲージで。表面は滑らかで均一。",
          "厚すぎず薄すぎず、一年を通して着られます。",
          "迷ったら、まずこの一枚から。",
        ],
      },
      en: {
        yarn: "60/1 compact cotton",
        structure: STRUCTURE.en,
        headline: "The standard white, for every day.",
        lines: [
          "Compact yarn with very little fuzz, at 36 gauge. The surface is smooth and even.",
          "Neither too thick nor too thin. You can wear it all year.",
          "If you are unsure, start here.",
        ],
      },
    },
  },
  "46g-jersey": {
    gauge: 46,
    weightGsm: 130,
    character: "Dense",
    copy: {
      ja: {
        yarn: "80/1 コーマコンパクト糸",
        structure: STRUCTURE.ja,
        headline: "薄く、密な白。",
        lines: [
          "1インチに針46本。カットソーとしては異例の密度です。",
          "薄手でも目が詰まり、布帛のような落ち感と控えめな光沢が出ます。",
          "ジャケットの下に、きれいに収まります。",
        ],
      },
      en: {
        yarn: "80/1 combed compact cotton",
        structure: STRUCTURE.en,
        headline: "A thin, dense white.",
        lines: [
          "46 needles per inch. That density is unusual for a jersey tee.",
          "Thin, but tightly knitted. It drapes like a woven cloth, with a restrained lustre.",
          "It sits cleanly under a jacket.",
        ],
      },
    },
  },
};

function toSpec(entry: GaugeEntry, locale: Locale): GaugeSpec {
  const { copy, ...facts } = entry;
  return { ...facts, ...copy[locale] };
}

/** The three gauges in ascending order, with copy in the given locale. */
export function getGaugeLadder(
  locale: Locale,
): Array<GaugeSpec & { fabricSlug: string }> {
  return Object.entries(GAUGE_ENTRY_BY_FABRIC_SLUG)
    .map(([fabricSlug, entry]) => ({ fabricSlug, ...toSpec(entry, locale) }))
    .sort((a, b) => a.gauge - b.gauge);
}

export function getGaugeSpec(
  fabricSlug: string | null | undefined,
  locale: Locale,
): GaugeSpec | null {
  const entry = fabricSlug ? GAUGE_ENTRY_BY_FABRIC_SLUG[fabricSlug] : null;
  return entry ? toSpec(entry, locale) : null;
}

/** Needles per inch for a fabric, when it is one of the gauge fabrics. */
export function getGaugeNumber(fabricSlug?: string | null): number | null {
  return (fabricSlug && GAUGE_ENTRY_BY_FABRIC_SLUG[fabricSlug]?.gauge) || null;
}

/** Fabric slugs of the gauge ladder, ascending. Locale-independent. */
export const GAUGE_FABRIC_SLUGS: readonly string[] = Object.entries(
  GAUGE_ENTRY_BY_FABRIC_SLUG,
)
  .sort(([, a], [, b]) => a.gauge - b.gauge)
  .map(([slug]) => slug);

export function formatWeight(spec: Pick<GaugeSpec, "weightGsm">): string {
  return `${spec.weightGsm}g/m²`;
}
