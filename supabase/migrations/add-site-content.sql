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
      "headline": "The space between cloth and skin.",
      "bodyParagraphs": [
        ["A white tee is the simplest garment,", "and the hardest to make well."],
        ["We knit our own cloth.", "Structure, cotton, air — in that order."],
        ["What you wear should disappear.", "What remains should feel true."]
      ]
    }'::jsonb
  ),
  (
    'stories',
    '{
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
    }'::jsonb
  )
on conflict (key) do nothing;
