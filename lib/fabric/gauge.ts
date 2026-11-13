/**
 * Gauge = needles per inch on the knitting machine. The whole store is
 * organised around this number, so every fabric carries one.
 */
export type GaugeSpec = {
  gauge: number;
  /** Yarn count as written on the mill's spec sheet. */
  yarn: string;
  /** Knit structure. */
  structure: string;
  /** Finished fabric weight in g/m². */
  weightGsm: number;
  /** One-word English character, shown beside the numeral. */
  character: string;
  /** Japanese headline for the gauge. */
  headlineJa: string;
  /** Two or three Japanese lines describing hand and use. */
  linesJa: readonly string[];
};

/**
 * 46G weight comes from the mill's finished-fabric master. 28G and 36G
 * weights are provisional until the white-tee lots are finished and measured.
 */
export const GAUGE_SPEC_BY_FABRIC_SLUG: Record<string, GaugeSpec> = {
  "28g-jersey": {
    gauge: 28,
    yarn: "40/2 コーマ糸",
    structure: "度詰天竺",
    weightGsm: 240,
    character: "Heavy",
    headlineJa: "形が立つ、肉厚の白。",
    linesJa: [
      "双糸を28ゲージで詰めて編んだ、厚みとハリのある天竺。",
      "透けにくく、洗っても首元と肩線が崩れにくい。",
      "一枚で着るための白です。",
    ],
  },
  "36g-jersey": {
    gauge: 36,
    yarn: "60/1 コンパクト糸",
    structure: "度詰天竺",
    weightGsm: 160,
    character: "Standard",
    headlineJa: "毎日着る、基準の白。",
    linesJa: [
      "毛羽の少ないコンパクト糸を36ゲージで。表面は滑らかで均一。",
      "厚すぎず薄すぎず、一年を通して着られます。",
      "迷ったら、まずこの一枚から。",
    ],
  },
  "46g-jersey": {
    gauge: 46,
    yarn: "80/1 コーマコンパクト糸",
    structure: "度詰天竺",
    weightGsm: 130,
    character: "Dense",
    headlineJa: "薄く、密な白。",
    linesJa: [
      "1インチに針46本。カットソーとしては異例の密度です。",
      "薄手でも目が詰まり、布帛のような落ち感と控えめな光沢が出ます。",
      "ジャケットの下に、きれいに収まります。",
    ],
  },
};

export const GAUGE_LADDER = Object.entries(GAUGE_SPEC_BY_FABRIC_SLUG)
  .map(([fabricSlug, spec]) => ({ fabricSlug, ...spec }))
  .sort((a, b) => a.gauge - b.gauge);

export function getGaugeSpec(fabricSlug?: string | null): GaugeSpec | null {
  return (fabricSlug && GAUGE_SPEC_BY_FABRIC_SLUG[fabricSlug]) || null;
}

export function formatWeight(spec: GaugeSpec): string {
  return `${spec.weightGsm}g/m²`;
}
