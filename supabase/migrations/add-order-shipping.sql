-- Add shipping address to orders (collected via Stripe Checkout)
alter table public.orders
  add column if not exists shipping_address jsonb;
