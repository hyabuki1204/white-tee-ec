-- Align site_content copy with quiet brand voice (about / stories)
update public.site_content
set
  content = '{
    "headline": "The space between cloth and skin.",
    "bodyParagraphs": [
      ["A white tee is the simplest garment,", "and the hardest to make well."],
      ["We knit our own cloth.", "Structure, cotton, air — in that order."],
      ["What you wear should disappear.", "What remains should feel true."]
    ]
  }'::jsonb,
  updated_at = now()
where key = 'about';

update public.site_content
set
  content = '{
    "pageTitle": "Stories",
    "introLines": [
      "The making of a white tee.",
      "Cloth, structure, air, process."
    ],
    "entries": [
      {
        "id": "fabric",
        "title": "Fabric",
        "lines": [
          "Jersey knit in-house.",
          "Weight, hand, and how quietly it holds light."
        ],
        "imageUrl": "/stories/fabric.jpg",
        "imageAlt": "Close-up of white knit cotton fabric"
      },
      {
        "id": "structure",
        "title": "Structure",
        "lines": [
          "Every stitch holds the line.",
          "Simple to see. Quiet to wear."
        ],
        "imageUrl": "/stories/structure.jpg",
        "imageAlt": "White yarn and knit structure"
      },
      {
        "id": "air",
        "title": "Air",
        "lines": [
          "Space between thread and skin.",
          "Air held in the knit from the start."
        ],
        "imageUrl": "/stories/air.jpg",
        "imageAlt": "Soft white fabric in gentle light"
      },
      {
        "id": "process",
        "title": "Process",
        "lines": [
          "Knitted in Wakayama.",
          "On our own machines, at our own pace."
        ],
        "imageUrl": "/stories/process.jpg",
        "imageAlt": "White yarn and knitting in soft light"
      }
    ]
  }'::jsonb,
  updated_at = now()
where key = 'stories';
