-- Sleeve length + fit type columns for navigation and PLP filtering

alter table public.products
  add column if not exists sleeve_type text not null default 'short'
    check (sleeve_type in ('short', 'long'));

alter table public.products
  add column if not exists fit_type text not null default 'regular'
    check (fit_type in ('slim', 'regular', 'relaxed', 'boxy'));

create index if not exists products_sleeve_fit_idx
  on public.products (sleeve_type, fit_type);

-- Backfill from fit_profile JSON where present
update public.products
set fit_type = coalesce(
  nullif(fit_profile->>'fitType', ''),
  fit_type
)
where fit_profile is not null;

update public.products
set sleeve_type = 'long'
where slug = 'long-sleeve-essential';

-- Sync fit_type from known slugs when profile missing
update public.products set fit_type = 'slim' where slug = 'compact-cotton-tee';
update public.products set fit_type = 'relaxed' where slug = 'relaxed-fit-tee';
update public.products set fit_type = 'boxy' where slug = 'box-fit-tee';
update public.products set fit_type = 'regular'
where slug in (
  'heavyweight-crew-neck',
  'lightweight-pocket-tee',
  'long-sleeve-essential'
);
