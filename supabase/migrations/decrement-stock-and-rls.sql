-- Stock decrement RPC + Row Level Security for production
-- Run via: npm run db:migrate (or Supabase SQL Editor)

-- ---------------------------------------------------------------------------
-- Atomic stock decrement
-- ---------------------------------------------------------------------------
create or replace function public.decrement_variant_stock(
  p_product_id uuid,
  p_size text,
  p_quantity integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  if p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  update public.product_variants
  set stock_quantity = stock_quantity - p_quantity
  where product_id = p_product_id
    and size = p_size
    and stock_quantity >= p_quantity;

  get diagnostics rows_affected = row_count;

  if rows_affected = 0 then
    raise exception 'Insufficient stock for product % size %', p_product_id, p_size;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Drop policies if re-running migration
drop policy if exists "Public read published products" on public.products;
drop policy if exists "Public read variants of published products" on public.product_variants;
drop policy if exists "Public read images of published products" on public.product_images;

create policy "Public read published products"
  on public.products
  for select
  using (is_published = true);

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

-- orders / order_items: no anon policies — service role only (admin + webhooks)
