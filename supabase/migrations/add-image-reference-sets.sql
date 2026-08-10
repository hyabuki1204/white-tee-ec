-- Brand reference image sets.
--
-- Consistency is what makes a feed read as a brand. A single strong image
-- is worth little if the next post looks like it came from somewhere else,
-- so FLUX 2 Pro's multi-reference support is attached to every production
-- job rather than chosen per brief: picking references by hand each time is
-- exactly how a series drifts.
--
-- Referenced images must be publicly fetchable by the provider, so a set
-- points at approved assets or existing site images, never at the private
-- drafts bucket.
--
-- See docs/image-generation-workflow.md §6.1.1.

create table if not exists public.image_reference_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',

  -- Exactly one set is applied automatically to production jobs.
  is_default boolean not null default false,

  -- Which purposes this set applies to. Empty means all of them.
  purposes public.image_purpose[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one default set
create unique index if not exists image_reference_sets_one_default
  on public.image_reference_sets (is_default)
  where is_default = true;

create table if not exists public.image_reference_images (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null
    references public.image_reference_sets(id) on delete cascade,

  -- Must be publicly reachable: the provider fetches it.
  url text not null,
  -- Present when the reference is itself an approved generation.
  asset_id uuid references public.image_assets(id) on delete set null,

  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists image_reference_images_set_idx
  on public.image_reference_images (set_id, sort_order);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'image_reference_sets_set_updated_at'
  ) then
    create trigger image_reference_sets_set_updated_at
      before update on public.image_reference_sets
      for each row execute function public.set_updated_at();
  end if;
end $$;
