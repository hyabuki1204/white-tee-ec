-- Supabase Storage bucket for site content images (home hero, stories, etc.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read site images'
  ) then
    create policy "Public read site images"
      on storage.objects
      for select
      using (bucket_id = 'site-images');
  end if;
end $$;
