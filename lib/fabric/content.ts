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
    tagline: "Dense cotton with structure.",
    descriptionLines: [
      "Knit at a higher gauge for weight and body.",
      "The surface holds its shape —",
      "white reads clearly, without softness blur.",
    ],
    imageUrl: "/fabric/heavyweight-jersey.jpg",
    imageAlt: "Heavyweight white cotton jersey texture",
    sortOrder: 1,
  },
  {
    slug: "lightweight-jersey",
    name: "Lightweight Jersey",
    tagline: "Soft hand, open breath.",
    descriptionLines: [
      "A lighter jersey for warmer days and closer contact.",
      "Fine yarn, relaxed tension —",
      "fabric that follows the skin without clinging.",
    ],
    imageUrl: "/fabric/lightweight-jersey.jpg",
    imageAlt: "Lightweight white cotton jersey texture",
    sortOrder: 2,
  },
  {
    slug: "relaxed-jersey",
    name: "Relaxed Jersey",
    tagline: "Room to move, quiet drape.",
    descriptionLines: [
      "Medium weight with a softer fall.",
      "Built for ease —",
      "shoulders drop, lines soften, white stays calm.",
    ],
    imageUrl: "/fabric/relaxed-jersey.jpg",
    imageAlt: "Relaxed white cotton jersey texture",
    sortOrder: 3,
  },
  {
    slug: "compact-jersey",
    name: "Compact Jersey",
    tagline: "Tight weave for layering.",
    descriptionLines: [
      "Compact yarn and a closer knit.",
      "Slim under a jacket, minimal under a shirt —",
      "structure without volume.",
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
      "Our baseline jersey — balanced, familiar, year-round.",
      "Neither heavy nor sheer —",
      "the cloth most days ask for.",
    ],
    imageUrl: "/fabric/essential-jersey.jpg",
    imageAlt: "Essential white cotton jersey texture",
    sortOrder: 5,
  },
  {
    slug: "box-jersey",
    name: "Box Jersey",
    tagline: "Substance without bulk.",
    descriptionLines: [
      "A slightly denser hand with a flat, even surface.",
      "Straight lines need a cloth that keeps them —",
      "presence in white, without noise.",
    ],
    imageUrl: "/fabric/box-jersey.jpg",
    imageAlt: "Box white cotton jersey texture",
    sortOrder: 6,
  },
];
