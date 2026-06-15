import {
  FABRIC_CHARACTER_BY_SLUG,
  type FabricCharacter,
} from "@/lib/fabric/character";
import { attachFabricJaHelpers } from "@/lib/fabric/i18n";

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
  "Weight, hand, light.",
] as const;

/** Product slug → fabric slug (mock-mode fallback). */
export const PRODUCT_FABRIC_SLUG_BY_PRODUCT_SLUG: Record<string, string> = {
  "heavyweight-crew-neck": "heavyweight-jersey",
  "lightweight-pocket-tee": "lightweight-jersey",
  "relaxed-fit-tee": "relaxed-jersey",
  "compact-cotton-tee": "compact-jersey",
  "long-sleeve-essential": "essential-jersey",
  "box-fit-tee": "box-jersey",
};

export const FABRICS: Fabric[] = [
  {
    slug: "heavyweight-jersey",
    name: "Heavyweight Jersey",
    tagline: "Dense cotton. Held shape.",
    descriptionLines: [
      "Higher gauge, more body.",
      "White reads clear, without blur.",
    ],
    imageUrl: "/fabric/heavyweight-jersey.jpg",
    imageAlt: "Heavyweight white cotton jersey texture",
    sortOrder: 1,
    character: FABRIC_CHARACTER_BY_SLUG["heavyweight-jersey"]!,
  },
  {
    slug: "lightweight-jersey",
    name: "Lightweight Jersey",
    tagline: "Soft hand. Open air.",
    descriptionLines: [
      "Fine yarn, open knit.",
      "Light on skin. Quiet in heat.",
    ],
    imageUrl: "/fabric/lightweight-jersey.jpg",
    imageAlt: "Lightweight white cotton jersey texture",
    sortOrder: 2,
    character: FABRIC_CHARACTER_BY_SLUG["lightweight-jersey"]!,
  },
  {
    slug: "relaxed-jersey",
    name: "Relaxed Jersey",
    tagline: "Room to move. Quiet drape.",
    descriptionLines: [
      "Medium weight, softer fall.",
      "Lines ease. White stays calm.",
    ],
    imageUrl: "/fabric/relaxed-jersey.jpg",
    imageAlt: "Relaxed white cotton jersey texture",
    sortOrder: 3,
    character: FABRIC_CHARACTER_BY_SLUG["relaxed-jersey"]!,
  },
  {
    slug: "compact-jersey",
    name: "Compact Jersey",
    tagline: "Close knit. Thin profile.",
    descriptionLines: [
      "Compact yarn, tighter knit.",
      "Structure without volume.",
    ],
    imageUrl: "/fabric/compact-jersey.jpg",
    imageAlt: "Compact white cotton jersey texture",
    sortOrder: 4,
    character: FABRIC_CHARACTER_BY_SLUG["compact-jersey"]!,
  },
  {
    slug: "essential-jersey",
    name: "Essential Jersey",
    tagline: "The everyday weight.",
    descriptionLines: [
      "Balanced, familiar, year-round.",
      "Neither heavy nor sheer.",
    ],
    imageUrl: "/fabric/essential-jersey.jpg",
    imageAlt: "Essential white cotton jersey texture",
    sortOrder: 5,
    character: FABRIC_CHARACTER_BY_SLUG["essential-jersey"]!,
  },
  {
    slug: "box-jersey",
    name: "Box Jersey",
    tagline: "Substance. Flat surface.",
    descriptionLines: [
      "Dense hand, even surface.",
      "Presence in white, without noise.",
    ],
    imageUrl: "/fabric/box-jersey.jpg",
    imageAlt: "Box white cotton jersey texture",
    sortOrder: 6,
    character: FABRIC_CHARACTER_BY_SLUG["box-jersey"]!,
  },
];
