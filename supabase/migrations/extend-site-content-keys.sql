-- Extend site_content allowed keys for legal, contact, shipping, privacy, terms, seo
alter table public.site_content
  drop constraint if exists site_content_key_check;

alter table public.site_content
  add constraint site_content_key_check
  check (key in (
    'home', 'about', 'stories',
    'legal', 'contact', 'shipping', 'privacy', 'terms', 'seo'
  ));
