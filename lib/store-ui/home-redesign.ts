import { HOME_FEATURED_PRODUCT_SLUG } from "@/lib/store-ui/home-featured";

export const HOME_IMAGES = {
  hero: {
    video: "/home/hero.mp4",
    poster: "/home/hero.png",
  },
  story: {
    material: "/home/story/material.png",
    finish: "/home/story/finish.png",
  },
} as const;

export const HOME_COPY = {
  hero: {
    lines: [
      "White tees in six jersey weights.",
      "Knit in Wakayama — slim to boxy.",
      "One standard: material, pattern, finish.",
    ],
  },
  proof: [
    {
      label: "Fabric",
      line: "Ultra-long staple cotton across six weights",
    },
    {
      label: "Pattern",
      line: "Slim to boxy — each silhouette calibrated",
    },
    {
      label: "Finish",
      line: "Wakayama flatlock seams, hand-shaped collar",
    },
  ],
  detail: {
    caption: "Representative fit",
  },
  story: [
    {
      key: "material",
      title: "Material",
      lines: ["Ultra-long staple.", "Six weights."],
      image: HOME_IMAGES.story.material,
    },
    {
      key: "finish",
      title: "Finish",
      lines: ["Wakayama.", "Hand finish."],
      image: HOME_IMAGES.story.finish,
    },
  ],
  cta: {
    label: "VIEW PIECE",
    productSlug: HOME_FEATURED_PRODUCT_SLUG,
  },
} as const;
