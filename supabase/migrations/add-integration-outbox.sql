-- Outbox for outbound integration events (n8n / Make / Slack).
--
-- Events are written here in the same breath as the state change that
-- caused them, and delivered separately. POSTing straight to n8n instead
-- would lose every event raised while n8n happened to be down — and the
-- events worth sending ("four images are waiting for review", "the
-- provider stopped") are exactly the ones you cannot afford to lose.
--
-- Delivery is at-least-once. Consumers dedupe on the event id.
--
-- See docs/image-generation-workflow.md §9.2.

create table if not exists public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,

  status text not null default 'pending'
    check (status in ('pending', 'delivered', 'failed')),
  attempt_count smallint not null default 0,
  max_attempts smallint not null default 5,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists integration_outbox_pickup_idx
  on public.integration_outbox (status, next_attempt_at)
  where status = 'pending';

create index if not exists integration_outbox_type_idx
  on public.integration_outbox (event_type, created_at desc);
