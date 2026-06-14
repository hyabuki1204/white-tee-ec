-- Fabrics table + products.fabric_slug foreign key

create table if not exists public.fabrics (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  description_lines jsonb not null default '[]'::jsonb,
  image_url text not null default '',
  image_alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists fabrics_set_updated_at on public.fabrics;

create trigger fabrics_set_updated_at
  before update on public.fabrics
  for each row execute function public.set_updated_at();

alter table public.products
  add column if not exists fabric_slug text references public.fabrics (slug) on delete restrict;

create index if not exists products_fabric_slug_idx on public.products (fabric_slug);

insert into public.fabrics (slug, name, tagline, description_lines, image_url, image_alt, sort_order)
values
  (
    'heavyweight-jersey',
    'Heavyweight Jersey',
    'Dense cotton with structure.',
    '["Knit at a higher gauge for weight and body.", "The surface holds its shape —", "white reads clearly, without softness blur."]'::jsonb,
    '/fabric/heavyweight-jersey.jpg',
    'Heavyweight white cotton jersey texture',
    1
  ),
  (
    'lightweight-jersey',
    'Lightweight Jersey',
    'Soft hand, open breath.',
    '["A lighter jersey for warmer days and closer contact.", "Fine yarn, relaxed tension —", "fabric that follows the skin without clinging."]'::jsonb,
    '/fabric/lightweight-jersey.jpg',
    'Lightweight white cotton jersey texture',
    2
  ),
  (
    'relaxed-jersey',
    'Relaxed Jersey',
    'Room to move, quiet drape.',
    '["Medium weight with a softer fall.", "Built for ease —", "shoulders drop, lines soften, white stays calm."]'::jsonb,
    '/fabric/relaxed-jersey.jpg',
    'Relaxed white cotton jersey texture',
    3
  ),
  (
    'compact-jersey',
    'Compact Jersey',
    'Tight weave for layering.',
    '["Compact yarn and a closer knit.", "Slim under a jacket, minimal under a shirt —", "structure without volume."]'::jsonb,
    '/fabric/compact-jersey.jpg',
    'Compact white cotton jersey texture',
    4
  ),
  (
    'essential-jersey',
    'Essential Jersey',
    'The everyday weight.',
    '["Our baseline jersey — balanced, familiar, year-round.", "Neither heavy nor sheer —", "the cloth most days ask for."]'::jsonb,
    '/fabric/essential-jersey.jpg',
    'Essential white cotton jersey texture',
    5
  ),
  (
    'box-jersey',
    'Box Jersey',
    'Substance without bulk.',
    '["A slightly denser hand with a flat, even surface.", "Straight lines need a cloth that keeps them —", "presence in white, without noise."]'::jsonb,
    '/fabric/box-jersey.jpg',
    'Box white cotton jersey texture',
    6
  )
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description_lines = excluded.description_lines,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  sort_order = excluded.sort_order,
  updated_at = now();

update public.products set fabric_slug = 'heavyweight-jersey'
where slug = 'heavyweight-crew-neck';

update public.products set fabric_slug = 'lightweight-jersey'
where slug = 'lightweight-pocket-tee';

update public.products set fabric_slug = 'relaxed-jersey'
where slug = 'relaxed-fit-tee';

update public.products set fabric_slug = 'compact-jersey'
where slug = 'compact-cotton-tee';

update public.products set fabric_slug = 'essential-jersey'
where slug = 'long-sleeve-essential';

update public.products set fabric_slug = 'box-jersey'
where slug = 'box-fit-tee';

alter table public.fabrics enable row level security;

drop policy if exists "Public read fabrics" on public.fabrics;

create policy "Public read fabrics"
  on public.fabrics
  for select
  using (true);
