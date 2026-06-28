export const HOME_IMAGES = {
  hero: {
    video: "/home/hero.mp4",
    poster: "/home/hero.png",
  },
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
      "Ultra-long staple cotton, knit to 180gsm.",
      "Circular-knit in Wakayama, gauge 30.",
      "Regular fit — sleeve drop and hem, refined.",
    ],
  },
  proof: [
    {
      label: "Fabric",
      line: "Ultra-long staple cotton, 180gsm compact jersey",
    },
    {
      label: "Pattern",
      line: "Drop-shoulder regular fit, hem length calibrated",
    },
    {
      label: "Finish",
      line: "Wakayama flatlock seams, hand-shaped collar",
    },
  ],
  detail: {
    model: { height: "175cm", size: "L size" },
    material: "Compact cotton jersey, smooth hand.",
    specs: [
      { label: "Sheerness", value: "Low — opaque in daylight" },
      { label: "Thickness", value: "Mid-weight, 180gsm" },
      { label: "Fit", value: "Regular, ease at shoulder" },
    ],
  },
  story: [
    {
      key: "material",
      title: "Material",
      lines: ["Ultra-long staple.", "180gsm."],
      image: HOME_IMAGES.story.material,
    },
    {
      key: "knitting",
      title: "Knitting",
      lines: ["Wakayama.", "Gauge 30."],
      image: HOME_IMAGES.story.knitting,
    },
    {
      key: "design",
      title: "Design",
      lines: ["Sleeve drop.", "Body length."],
      image: HOME_IMAGES.story.design,
    },
    {
      key: "finish",
      title: "Finish",
      lines: ["Collar shaped.", "Seams pressed."],
      image: HOME_IMAGES.story.finish,
    },
  ],
  cta: {
    label: "VIEW PRODUCTS",
    href: "/#products",
  },
} as const;
