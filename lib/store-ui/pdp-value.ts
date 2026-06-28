import type { FabricCharacter, FabricCharacterLevel } from "@/lib/fabric/character";
import type { Fabric } from "@/lib/fabric/content";
import { PRICE_POSITIONING } from "@/lib/store-ui/credibility";
import type { Product } from "@/types";

export const PDP_VALUE_IMAGES = {
  fabric: "/store/pdp-fabric-macro.png",
  finish: "/store/pdp-collar-finish.png",
} as const;

const THICKNESS_COPY: Record<FabricCharacterLevel, string> = {
  1: "Fine gauge, open hand.",
  2: "Light knit with air between loops.",
  3: "Balanced body and drape.",
  4: "Substantial jersey with held shape.",
  5: "Dense heavyweight knit.",
};

const SHEERNESS_COPY: Record<FabricCharacterLevel, string> = {
  1: "Opaque in daylight.",
  2: "Low show-through.",
  3: "Moderate in strong light.",
  4: "Noticeable in direct sun.",
  5: "Sheer in daylight.",
};

const FABRIC_VALUE_LINES: Record<string, readonly string[]> = {
  "heavyweight-jersey": [
    "Compact cotton jersey with held structure.",
    "Knit in Wakayama at higher gauge for body.",
    "White reads clear — no blur at the hem or collar.",
  ],
  "lightweight-jersey": [
    "Fine yarn, open knit for heat and movement.",
    "Circular-knit in Wakayama for even surface.",
    "Light on skin without losing shape through the day.",
  ],
  "relaxed-jersey": [
    "Mid-weight cotton with ease built into the knit.",
    "Wakayama circular knit, tuned for drape.",
    "Relaxed through the body without excess volume.",
  ],
  "compact-jersey": [
    "Tighter gauge for a clean, slim line.",
    "Knit in Wakayama to hold collar and hem.",
    "Smooth hand with minimal surface fuzz.",
  ],
  "essential-jersey": [
    "Everyday jersey weight — balanced thickness.",
    "Wakayama knit for consistent loop tension.",
    "The baseline white tee in the lineup.",
  ],
  "box-jersey": [
    "Wide gauge with structure at shoulder and hem.",
    "Dense Wakayama knit for a boxy, architectural line.",
    "Volume without softness — shape stays intentional.",
  ],
};

const CONSTRUCTION_LINES = [
  "Flatlock seams at shoulder and side.",
  "Collar shaped and pressed by hand.",
  "Inspected before leaving Wakayama.",
] as const;

export type PdpValueContent = {
  headline: string;
  lines: readonly string[];
  construction: readonly string[];
  priceNote?: string;
  specs: { label: string; value: string }[];
  images: { src: string; alt: string }[];
};

function characterSpec(
  character: FabricCharacter,
): { label: string; value: string }[] {
  return [
    { label: "Thickness", value: THICKNESS_COPY[character.thickness] },
    { label: "Sheerness", value: SHEERNESS_COPY[character.sheerness] },
  ];
}

export function buildPdpValueContent(
  product: Product,
  fabric: Fabric | null | undefined,
): PdpValueContent {
  const fabricSlug = fabric?.slug ?? product.fabricSlug ?? "essential-jersey";
  const character = fabric?.character ?? {
    thickness: 3,
    softness: 3,
    structure: 3,
    sheerness: 2,
    surface: 3,
  };

  return {
    headline: "Why this tee",
    lines:
      FABRIC_VALUE_LINES[fabricSlug] ??
      FABRIC_VALUE_LINES["essential-jersey"]!,
    construction: CONSTRUCTION_LINES,
    priceNote: PRICE_POSITIONING.care,
    specs: [
      ...characterSpec(character),
      { label: "Fit", value: product.fitProfile.fitLabel },
      { label: "Origin", value: "Knit in Wakayama" },
    ],
    images: [
      {
        src: PDP_VALUE_IMAGES.fabric,
        alt: `${fabric?.name ?? "Jersey"} fabric texture`,
      },
      {
        src: PDP_VALUE_IMAGES.finish,
        alt: "Collar and seam construction detail",
      },
    ],
  };
}
