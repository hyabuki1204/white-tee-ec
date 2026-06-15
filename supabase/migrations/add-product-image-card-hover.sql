-- Card hover image flag for product listing hover swap

alter table public.product_images
  add column if not exists is_card_hover boolean not null default false;

create unique index if not exists product_images_one_card_hover_per_product
  on public.product_images (product_id)
  where is_card_hover = true;

-- Backfill: prefer -04 model wear images where present
update public.product_images
set is_card_hover = true
where url ~ '-04\.(jpg|jpeg|webp|png)$'
  and not exists (
    select 1
    from public.product_images existing
    where existing.product_id = product_images.product_id
      and existing.is_card_hover = true
      and existing.id <> product_images.id
  );
