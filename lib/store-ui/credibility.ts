export const CREDIBILITY_IMAGES = {
  factory: "/store/credibility-factory.png",
  wear: "/store/credibility-wear.png",
  packaging: "/store/credibility-packaging.png",
  craft: "/store/price-craft.png",
} as const;

export type EditorialVoice = {
  source: string;
  line: string;
  detail?: string;
};

export type WearingNote = {
  fabric: string;
  months: number;
  lines: readonly string[];
};

export const EDITORIAL_VOICES: EditorialVoice[] = [
  {
    source: "POPEYE",
    line: "A white tee that begins at the knitting machine — not the label.",
    detail: "Editorial · 2025",
  },
  {
    source: "BRUTUS",
    line: "Six jersey weights, one factory. The difference is readable in the hand.",
    detail: "Feature · 2025",
  },
  {
    source: "Atelier note",
    line: "Most customers own two weights — heavyweight for structure, lightweight for heat.",
    detail: "From purchase data",
  },
];

export const WEARING_NOTES: WearingNote[] = [
  {
    fabric: "Heavyweight Jersey",
    months: 8,
    lines: [
      "Collar holds its line. No curl at the neck after repeated washes.",
      "Surface softens; structure stays. The tee looks quieter, not tired.",
    ],
  },
  {
    fabric: "Lightweight Jersey",
    months: 6,
    lines: [
      "Breathable from the first wear. Drape opens slightly with washing.",
      "Sheerness stays predictable in daylight — not a surprise after one wash.",
    ],
  },
  {
    fabric: "Compact Jersey",
    months: 5,
    lines: [
      "Slim line stays clean at hem and sleeve. Minimal stretch at cuff.",
      "Smooth hand from day one — no surface fuzz after three washes.",
    ],
  },
];

export const FACTS = [
  { label: "Factory", value: "Kanemasa, Wakayama" },
  { label: "Jersey weights", value: "Six calibrations" },
  { label: "Cotton", value: "Ultra-long staple" },
  { label: "Finish", value: "Hand-shaped collar" },
] as const;

export const PRICE_POSITIONING = {
  headline: "What the price holds",
  intro:
    "WHITE TEE is priced for in-house knitting, calibrated jersey weights, and finish work in Wakayama — not for a label on a blank.",
  lines: [
    "Ultra-long staple cotton selected before the first loop.",
    "Circular-knit in our Wakayama factory — gauge controlled per weight.",
    "Flatlock seams, shaped collar, inspected before shipping.",
    "Six silhouettes across six jerseys — not one tee renamed twelve times.",
  ],
  range:
    "Positioned alongside specialty Japanese labels at ¥12,000–18,000. Current collection from ¥7,200.",
  care:
    "Built to soften with wear, not lose shape in a season.",
} as const;

export const HOME_CREDIBILITY = {
  title: "Credibility",
  voicesTitle: "Editorial & wear",
  wearingTitle: "After months of wear",
  factsTitle: "At a glance",
  stockistLink: "Our factory in Wakayama",
  journalLink: "Read the journal",
} as const;

export const PDP_CREDIBILITY = {
  voicesTitle: "What others say",
  wearingTitle: "Wear over time",
  priceTitle: PRICE_POSITIONING.headline,
} as const;

export function getWearingNoteForFabric(
  fabricName: string | null | undefined,
): WearingNote | null {
  if (!fabricName) return WEARING_NOTES[0] ?? null;

  return (
    WEARING_NOTES.find(
      (note) => note.fabric.toLowerCase() === fabricName.toLowerCase(),
    ) ??
    WEARING_NOTES.find((note) =>
      fabricName.toLowerCase().includes(note.fabric.split(" ")[0]!.toLowerCase()),
    ) ??
    WEARING_NOTES[0] ??
    null
  );
}
