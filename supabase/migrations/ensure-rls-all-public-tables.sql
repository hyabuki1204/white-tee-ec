-- Ensure Row Level Security is enabled on every public table.
-- Fixes Supabase advisor warning: rls_disabled_in_public
-- Safe to re-run (idempotent).

-- ---------------------------------------------------------------------------
-- Enable RLS on all application tables
-- ---------------------------------------------------------------------------
alter table if exists public.fabrics enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.product_variants enable row level security;
alter table if exists public.product_images enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.site_content enable row level security;
alter table if exists public.schema_migrations enable row level security;

-- ---------------------------------------------------------------------------
-- Public read policies (anon + authenticated)
-- ---------------------------------------------------------------------------
drop policy if exists "Public read fabrics" on public.fabrics;
create policy "Public read fabrics"
  on public.fabrics
  for select
  using (true);

drop policy if exists "Public read published products" on public.products;
create policy "Public read published products"
  on public.products
  for select
  using (is_published = true);

drop policy if exists "Public read variants of published products" on public.product_variants;
create policy "Public read variants of published products"
  on public.product_variants
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.is_published = true
    )
  );

drop policy if exists "Public read images of published products" on public.product_images;
create policy "Public read images of published products"
  on public.product_images
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.is_published = true
    )
  );

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
  on public.site_content
  for select
  using (true);

-- orders / order_items / schema_migrations: no anon policies — service role only
