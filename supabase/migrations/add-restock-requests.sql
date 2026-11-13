-- Back-in-stock requests from the storefront (product page, mobile purchase
-- bar, /saved). One row = "email this address once when this size of this
-- product is available again".
--
-- A request is pending while notified_at is null. The application sets
-- notified_at only after the email provider accepted the message, so the
-- table is its own send queue: anything still pending is retried the next
-- time the product is saved with stock, or by the dispatch endpoint.
--
-- The variant is identified by (product_id, size) rather than by
-- product_variants.id: the admin size toggle deletes and re-creates variant
-- rows, and a request must survive that.
--
-- Emails are stored lower-cased so the unique index covers case variants.
-- This list is separate from newsletter_subscribers on purpose — asking for
-- a restock notice is not a newsletter sign-up.
create table if not exists public.restock_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and char_length(email) <= 254),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  locale text not null default 'ja' check (locale in ('ja', 'en')),
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

-- One pending request per address and variant. Once notified, the same
-- address may ask again the next time the size sells out.
create unique index if not exists restock_requests_pending_unique
  on public.restock_requests (email, product_id, size)
  where notified_at is null;

-- Pickup when a variant comes back, and the admin list.
create index if not exists restock_requests_pending_variant_idx
  on public.restock_requests (product_id, size, created_at)
  where notified_at is null;

-- Personal data: no anon/authenticated access. Only the service role
-- (server-side API route) can read or write.
alter table public.restock_requests enable row level security;
