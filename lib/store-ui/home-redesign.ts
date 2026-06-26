export const HOME_IMAGES = {
  hero: "/home/hero.png",
  detail: {
    front: "/home/detail/front.png",
    side: "/home/detail/side.png",
    full: "/home/detail/full.png",
  },
  story: {
    material: "/home/story/material.png",
    knitting: "/home/story/knitting.png",
    design: "/home/story/design.png",
    finish: "/home/story/finish.png",
  },
} as const;

export const HOME_COPY = {
  hero: {
    lines: [
      "Material, knit, and pattern.",
      "Considered from fiber to finish.",
      "The white tee, designed.",
    ],
  },
  proof: [
    { label: "Fabric", line: "Premium cotton jersey, 180gsm" },
    { label: "Pattern", line: "Refined regular fit, balanced drop" },
    { label: "Finish", line: "Flatlock seams, clean neckline" },
  ],
  detail: {
    model: { height: "175cm", size: "L size" },
    material: [
      "Compact cotton jersey with a smooth hand.",
      "Breathable knit, structured for daily wear.",
    ],
  },
  story: [
    {
      key: "material",
      title: "Material",
      lines: ["Long-staple cotton selected for density and hand."],
      image: HOME_IMAGES.story.material,
    },
    {
      key: "knitting",
      title: "Knitting",
      lines: ["Circular knit at controlled gauge for even surface."],
      image: HOME_IMAGES.story.knitting,
    },
    {
      key: "design",
      title: "Design",
      lines: ["Pattern refined for proportion and sleeve drop."],
      image: HOME_IMAGES.story.design,
    },
    {
      key: "finish",
      title: "Finish",
      lines: ["Seams pressed, collar shaped, inspected by hand."],
      image: HOME_IMAGES.story.finish,
    },
  ],
  cta: {
    label: "VIEW PRODUCTS",
    href: "/#products",
  },
} as const;
