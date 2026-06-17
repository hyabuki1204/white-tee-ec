-- Customer order notes from cart drawer / checkout
alter table public.orders
  add column if not exists order_notes text;
