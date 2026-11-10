-- Newsletter sign-ups from the storefront (home section + footer).
-- Emails are stored lower-cased so the unique constraint covers case variants.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  source text not null default 'home' check (source in ('home', 'footer')),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Personal data: no anon/authenticated access. Only the service role
-- (server-side API route) can read or write.
alter table public.newsletter_subscribers enable row level security;
