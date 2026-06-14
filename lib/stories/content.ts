export type StoryEntry = {
  id: string;
  title: string;
  lines: readonly string[];
  imageUrl: string;
  imageAlt: string;
};

export const STORIES_PAGE_TITLE = "Stories";

export const STORIES_INTRO_LINES = [
  "The making of a white tee.",
  "Cloth, structure, air, process.",
] as const;

export const STORY_ENTRIES: StoryEntry[] = [
  {
    id: "fabric",
    title: "Fabric",
    lines: [
      "Jersey knit in-house.",
      "Weight, hand, and how quietly it holds light.",
    ],
    imageUrl: "/stories/fabric.jpg",
    imageAlt: "Close-up of white knit cotton fabric",
  },
  {
    id: "structure",
    title: "Structure",
    lines: [
      "Every stitch holds the line.",
      "Simple to see. Quiet to wear.",
    ],
    imageUrl: "/stories/structure.jpg",
    imageAlt: "White yarn and knit structure",
  },
  {
    id: "air",
    title: "Air",
    lines: [
      "Space between thread and skin.",
      "Air held in the knit from the start.",
    ],
    imageUrl: "/stories/air.jpg",
    imageAlt: "Soft white fabric in gentle light",
  },
  {
    id: "process",
    title: "Process",
    lines: [
      "Knitted in Wakayama.",
      "On our own machines, at our own pace.",
    ],
    imageUrl: "/stories/process.jpg",
    imageAlt: "White yarn and knitting in soft light",
  },
];
