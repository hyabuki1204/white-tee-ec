-- WHITE TEE EC — Supabase schema (minimum viable)
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.order_status as enum (
  'pending',
  'paid',
  'shipped',
  'cancelled',
  'failed'
);

-- ---------------------------------------------------------------------------
-- fabrics
-- ---------------------------------------------------------------------------
create table public.fabrics (
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

create trigger fabrics_set_updated_at
  before update on public.fabrics
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  detail_description text not null default '',
  fit_note text,
  material text not null default 'COTTON 100%',
  care text not null default '',
  size_guide jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  price integer not null check (price >= 0),
  fabric_slug text references public.fabrics (slug) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_fabric_slug_idx on public.products (fabric_slug);

-- ---------------------------------------------------------------------------
-- product_variants (size / SKU / stock)
-- ---------------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  sku text unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, size)
);

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one primary image per product
create unique index product_images_one_primary_per_product
  on public.product_images (product_id)
  where is_primary = true;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  status public.order_status not null default 'pending',
  total_amount integer not null check (total_amount >= 0),
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_stripe_payment_intent_id_idx
  on public.orders (stripe_payment_intent_id);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger (orders)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS (Row Level Security) — NOT enabled yet
-- ---------------------------------------------------------------------------
-- Policy direction for later:
--
-- products / product_variants / product_images:
--   - SELECT: public (anon + authenticated)
--   - INSERT/UPDATE/DELETE: service role or admin only
--
-- orders / order_items:
--   - SELECT: owner (user_id = auth.uid()) or service role
--   - INSERT: service role (Stripe webhook) or authenticated checkout
--   - UPDATE status: service role only (webhook)
--
-- Example (enable when ready):
--   alter table public.products enable row level security;
--   create policy "Public read products"
--     on public.products for select
--     using (true);
