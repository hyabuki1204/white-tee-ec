-- Extended product fields for PDP tabs + admin CRUD
alter table public.products
  add column if not exists detail_description text not null default '',
  add column if not exists fit_note text,
  add column if not exists material text not null default 'COTTON 100%',
  add column if not exists care text not null default '',
  add column if not exists size_guide jsonb not null default '[]'::jsonb,
  add column if not exists is_published boolean not null default true;

-- Backfill existing rows
update public.products
set
  detail_description = case
    when detail_description = '' then description
    else detail_description
  end,
  care = case
    when care = '' then 'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.'
    else care
  end
where detail_description = '' or care = '';

-- Supabase Storage bucket for product images (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public read for storefront / next/image
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read product images'
  ) then
    create policy "Public read product images"
      on storage.objects
      for select
      using (bucket_id = 'product-images');
  end if;
end $$;
