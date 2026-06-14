-- Site content CMS (home / about / stories)
create table if not exists public.site_content (
  key text primary key check (key in ('home', 'about', 'stories')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_set_updated_at on public.site_content;

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Public read site content" on public.site_content;

create policy "Public read site content"
  on public.site_content
  for select
  using (true);

-- Seed defaults (safe to re-run)
insert into public.site_content (key, content)
values
  (
    'home',
    '{
      "heroImage": "/home/hero.jpg",
      "heroCopy": "White, only.",
      "conceptLines": [
        "White is not empty.",
        "It is what remains when everything else is removed."
      ],
      "featuredProductCount": 3
    }'::jsonb
  ),
  (
    'about',
    '{
      "headline": "The space between fabric and skin.",
      "bodyParagraphs": [
        ["A white T-shirt is the simplest thing to make,", "and the hardest to get right."],
        ["We knit our own fabric.", "We think in structure, in cotton, in air."],
        ["What you wear should disappear.", "What remains should feel true."]
      ]
    }'::jsonb
  ),
  (
    'stories',
    '{
      "pageTitle": "Stories",
      "introLines": [
        "How a white T-shirt is made —",
        "and why each decision matters."
      ],
      "entries": [
        {
          "id": "fabric",
          "title": "Fabric",
          "lines": [
            "We knit our own jersey.",
            "Cotton is chosen for weight, hand,",
            "and how quietly it holds light."
          ],
          "imageUrl": "/stories/fabric.jpg",
          "imageAlt": "Close-up of white knit cotton fabric"
        },
        {
          "id": "structure",
          "title": "Structure",
          "lines": [
            "Every stitch shapes the silhouette.",
            "What you see is simple —",
            "what you feel is carefully built."
          ],
          "imageUrl": "/stories/structure.jpg",
          "imageAlt": "White yarn and knit structure"
        },
        {
          "id": "air",
          "title": "Air",
          "lines": [
            "Space between thread and skin.",
            "Breathability is not added later —",
            "it is part of the form from the start."
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
    }'::jsonb
  )
on conflict (key) do nothing;
