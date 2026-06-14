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
};

export const FABRIC_PAGE_TITLE = "Fabric";

export const FABRIC_INTRO_LINES = [
  "Every white tee begins with the cloth.",
  "Weight, hand, and how quietly it holds light.",
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
  },
];
