export type StoryEntry = {
  id: string;
  title: string;
  lines: readonly string[];
  imageUrl: string;
  imageAlt: string;
};

export const STORIES_PAGE_TITLE = "Stories";

export const STORIES_INTRO_LINES = [
  "How a white T-shirt is made —",
  "and why each decision matters.",
] as const;

export const STORY_ENTRIES: StoryEntry[] = [
  {
    id: "fabric",
    title: "Fabric",
    lines: [
      "We knit our own jersey.",
      "Cotton is chosen for weight, hand,",
      "and how quietly it holds light.",
    ],
    imageUrl: "/stories/fabric.jpg",
    imageAlt: "Close-up of white knit cotton fabric",
  },
  {
    id: "structure",
    title: "Structure",
    lines: [
      "Every stitch shapes the silhouette.",
      "What you see is simple —",
      "what you feel is carefully built.",
    ],
    imageUrl: "/stories/structure.jpg",
    imageAlt: "White yarn and knit structure",
  },
  {
    id: "air",
    title: "Air",
    lines: [
      "Space between thread and skin.",
      "Breathability is not added later —",
      "it is part of the form from the start.",
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
