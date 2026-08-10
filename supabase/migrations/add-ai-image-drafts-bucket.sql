-- Private storage bucket for unapproved AI-generated images.
--
-- This is the technical core of the approval gate: an image that has not been
-- approved has no public URL to leak. The admin UI reads these through
-- short-lived signed URLs issued by the service role.
--
-- Approved production assets are copied to product-images / site-images,
-- which are the public buckets. Nothing is ever served from here directly.
--
-- Deliberately no "public read" policy: without one, only the service role
-- can read the bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-image-drafts',
  'ai-image-drafts',
  false,
  20971520, -- 20 MB: generated images run larger than the 5 MB admin uploads
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
