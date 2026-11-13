import {
  FABRIC_CHARACTER_BY_SLUG,
  type FabricCharacter,
} from "@/lib/fabric/character";

export type Fabric = {
  slug: string;
  name: string;
  /** One-line copy for cards and hero. */
  tagline: string;
  /** Two to four lines for the detail page. */
  descriptionLines: readonly string[];
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
  character: FabricCharacter;
  /** One-line Japanese summary for detail / product link. */
  helperJa?: string | null;
  /** Optional lighter Japanese line under tagline on cards. */
  taglineJa?: string | null;
};

export const FABRIC_PAGE_TITLE = "Fabric";

export const FABRIC_INTRO_LINES = [
  "The cloth comes first.",
  "Three gauges — 28, 36, 46 needles to the inch. Each one a different white.",
] as const;

import { PRODUCT_CATALOG } from "@/lib/products/product-catalog";

/** Product slug → fabric slug (mock-mode fallback). */
export const PRODUCT_FABRIC_SLUG_BY_PRODUCT_SLUG: Record<string, string> =
  Object.fromEntries(
    PRODUCT_CATALOG.map((entry) => [entry.slug, entry.fabricSlug]),
  );

export const FABRICS: Fabric[] = [
  {
    slug: "28g-jersey",
    name: "28G Jersey",
    tagline: "Thick. Holds its line.",
    descriptionLines: [
      "Two-ply combed yarn, knit tight at 28 gauge.",
      "240 g/m². Low sheer. Collar and shoulder keep their shape.",
      "A white to wear on its own.",
    ],
    imageUrl: "/fabric/28g-jersey.jpg",
    imageAlt: "28-gauge white cotton jersey, close-up",
    sortOrder: 1,
    character: FABRIC_CHARACTER_BY_SLUG["28g-jersey"]!,
  },
  {
    slug: "36g-jersey",
    name: "36G Jersey",
    tagline: "The standard white.",
    descriptionLines: [
      "Compact yarn at 36 gauge. Smooth, even surface.",
      "160 g/m². Neither heavy nor thin.",
      "The one to start with.",
    ],
    imageUrl: "/fabric/36g-jersey.jpg",
    imageAlt: "36-gauge white cotton jersey, close-up",
    sortOrder: 2,
    character: FABRIC_CHARACTER_BY_SLUG["36g-jersey"]!,
  },
  {
    slug: "46g-jersey",
    name: "46G Jersey",
    tagline: "Thin. Dense. Smooth.",
    descriptionLines: [
      "46 needles to the inch — rare for a cut-and-sewn tee.",
      "130 g/m². Falls like a woven, with a quiet lustre.",
      "Sits clean under a jacket.",
    ],
    imageUrl: "/fabric/46g-jersey.jpg",
    imageAlt: "46-gauge white cotton jersey, close-up",
    sortOrder: 3,
    character: FABRIC_CHARACTER_BY_SLUG["46g-jersey"]!,
  },
];
