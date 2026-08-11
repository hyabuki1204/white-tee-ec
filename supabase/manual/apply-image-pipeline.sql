-- ---------------------------------------------------------------------------
-- WHITE TEE — 画像生成パイプライン 手動適用スクリプト
-- ---------------------------------------------------------------------------
-- Supabase Dashboard → SQL Editor に丸ごと貼って一度だけ実行する。
--
-- なぜ手動なのか:
--   Vercel に DATABASE_URL が入っていないため postbuild のマイグレーションが
--   スキップされている。ここで DATABASE_URL を足すと、これまで手で当ててきた
--   27 本すべてが「未適用」と判定されて再実行され、update-site-copy-tone.sql や
--   update-premium-pricing.sql のようなデータ上書き系が管理画面での編集を
--   巻き戻してしまう。それを避けるため、
--     (1) 既存 27 本を「適用済み」として台帳に記録し
--     (2) 画像パイプラインの 4 本だけを実際に流す
--   という順序にしてある。以後は DATABASE_URL を入れても安全になる。
--
-- 冪等: 二度流しても壊れない。
-- ---------------------------------------------------------------------------

create table if not exists public.schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);

-- 既存マイグレーションを「適用済み」として記録（実行はしない）
insert into public.schema_migrations (name) values
  ('add-fabric-character.sql'),
  ('add-fabrics.sql'),
  ('add-order-notes.sql'),
  ('add-order-shipping.sql'),
  ('add-product-detail-fields.sql'),
  ('add-product-fit-profile.sql'),
  ('add-product-image-card-hover.sql'),
  ('add-product-silhouette-fields.sql'),
  ('add-shipped-status.sql'),
  ('add-site-content.sql'),
  ('add-site-images-bucket.sql'),
  ('add-twelve-sku-expansion.sql'),
  ('decrement-stock-and-rls.sql'),
  ('extend-site-content-keys.sql'),
  ('fix-compact-cotton-tee-image.sql'),
  ('update-local-fabric-images.sql'),
  ('update-local-product-images.sql'),
  ('update-model-wear-jpg.sql'),
  ('update-premium-pricing.sql'),
  ('update-product-images-multi.sql'),
  ('update-site-copy-tone.sql'),
  ('update-stories-process-copy.sql'),
  ('update-stories-process.sql')
on conflict (name) do nothing;


-- ===========================================================================
-- add-ai-image-drafts-bucket.sql
-- ===========================================================================

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


-- ===========================================================================
-- add-image-generation.sql
-- ===========================================================================

-- Image generation pipeline: Claude as creative director, a swappable image
-- provider as the renderer, and a mandatory human approval gate.
--
-- See docs/image-generation-workflow.md for the full design.
--
-- Enums, tables and the job-claim function live in one file because
-- scripts/run-migrations.mjs applies files in alphabetical order, and
-- claim_image_jobs() depends on image_generation_jobs existing.

-- ---------------------------------------------------------------------------
-- updated_at trigger function (idempotent re-declaration; matches schema.sql)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'image_purpose') then
    create type public.image_purpose as enum (
      'instagram_teaser',   -- 4:5 / 1:1, headroom for overlaid text
      'ec_hero',            -- 16:9 / 3:2, copy space on one side
      'product_lp',         -- 3:4, detail-leaning
      'journal',            -- 3:2, wide establishing shot
      'fabric'              -- 1:1, fabric macro
    );
  end if;

  -- What is depicted. This is what decides whether an image may ship.
  if not exists (select 1 from pg_type where typname = 'image_subject_class') then
    create type public.image_subject_class as enum (
      'scenery_mood',       -- light, air, place. The product is not the subject
      'styling_scene',      -- worn, but the subject is still the atmosphere
      'product_depiction',  -- the product itself
      'fabric_macro'        -- fabric texture close-up
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'image_release_policy') then
    create type public.image_release_policy as enum (
      'production',    -- may be copied to a public bucket once approved
      'internal_test'  -- may be approved, but never leaves the private bucket
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'image_job_status') then
    create type public.image_job_status as enum (
      'queued',       -- enqueued, or waiting on next_attempt_at after a retry
      'submitting',   -- leased by a worker, mid-submit
      'submitted',    -- provider accepted; provider_job_id present
      'running',      -- generating
      'succeeded',    -- image URLs available, not yet ingested
      'downloading',  -- ingesting into storage
      'stored',       -- ingested; review items now exist (terminal)
      'failed',       -- permanent failure (terminal)
      'cancelled',    -- stopped by a human (terminal)
      'expired'       -- outlived expires_at, reclaimed by the reaper (terminal)
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'image_review_state') then
    create type public.image_review_state as enum (
      'pending_review',
      'approved',
      'rejected',
      'needs_revision'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'image_concept_status') then
    create type public.image_concept_status as enum (
      'draft',           -- Claude produced it, nobody has looked yet
      'prompt_approved', -- cleared approval gate 1
      'discarded'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- image_briefs : the human request that starts everything
-- ---------------------------------------------------------------------------
create table if not exists public.image_briefs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  purpose public.image_purpose not null,

  -- Decides whether output may ship. See the mapping table in the design doc.
  subject_class public.image_subject_class not null default 'scenery_mood',
  release_policy public.image_release_policy not null default 'internal_test',

  -- What the image needs to say, in the requester's own words.
  -- This is Claude's primary input.
  intent text not null default '',

  -- Real product/fabric data to ground the brand context block.
  product_id uuid references public.products(id) on delete set null,
  fabric_slug text references public.fabrics(slug) on delete set null,

  desired_variant_count smallint not null default 4
    check (desired_variant_count between 1 and 8),
  constraints jsonb not null default '{}'::jsonb,
  due_date date,

  created_by text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Product and fabric depictions are test-only. Enforced here so no
  -- application bug can route them to a production release policy.
  constraint image_briefs_release_policy_guard check (
    subject_class not in ('product_depiction', 'fabric_macro')
    or release_policy = 'internal_test'
  )
);

create index if not exists image_briefs_purpose_idx
  on public.image_briefs (purpose, created_at desc);

create index if not exists image_briefs_release_policy_idx
  on public.image_briefs (release_policy);

-- ---------------------------------------------------------------------------
-- image_prompt_templates : versioned Claude system prompts
--   Lets us answer "which prompt produced this image" months later.
-- ---------------------------------------------------------------------------
create table if not exists public.image_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('director', 'prompt_engineer', 'qa')),
  version integer not null,
  model text not null,
  system_prompt text not null,
  params jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (role, version)
);

-- At most one active template per role
create unique index if not exists image_prompt_templates_one_active_per_role
  on public.image_prompt_templates (role)
  where is_active = true;

-- ---------------------------------------------------------------------------
-- image_concepts : Claude stage 1 and 2 output
-- ---------------------------------------------------------------------------
create table if not exists public.image_concepts (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.image_briefs(id) on delete cascade,

  -- Revision loop: a rejected result feeds its notes into a child concept.
  parent_concept_id uuid references public.image_concepts(id) on delete set null,
  revision smallint not null default 1 check (revision between 1 and 5),
  status public.image_concept_status not null default 'draft',

  title text not null,
  concept jsonb not null,          -- stage 1: composition, light, styling, mood
  render_spec jsonb,               -- stage 2: provider-neutral intermediate form
  render_spec_override jsonb,      -- human edit; the original is kept for audit

  director_template_id uuid references public.image_prompt_templates(id),
  engineer_template_id uuid references public.image_prompt_templates(id),
  claude_input_tokens integer not null default 0,
  claude_output_tokens integer not null default 0,

  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists image_concepts_brief_idx
  on public.image_concepts (brief_id, revision);

create index if not exists image_concepts_status_idx
  on public.image_concepts (status);

-- ---------------------------------------------------------------------------
-- image_generation_jobs : one provider submission. The state machine lives here.
-- ---------------------------------------------------------------------------
create table if not exists public.image_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.image_concepts(id) on delete cascade,
  status public.image_job_status not null default 'queued',

  provider text not null,
  provider_job_id text,

  -- What was actually sent, after provider-specific rendering. Kept so a
  -- generation can be reproduced or replayed on a different provider.
  submitted_prompt text not null default '',
  submitted_params jsonb not null default '{}'::jsonb,
  requested_variant_count smallint not null default 4
    check (requested_variant_count between 1 and 8),
  seed bigint,

  -- Double submission means double billing. This unique constraint is the
  -- last line of defence behind the provider's own idempotency support.
  idempotency_key text not null unique,

  attempt_count smallint not null default 0,
  max_attempts smallint not null default 5,
  next_attempt_at timestamptz not null default now(),

  -- Worker lease, so overlapping cron runs cannot double-process a job.
  claimed_by text,
  claimed_at timestamptz,
  lease_expires_at timestamptz,

  -- Normalized failure info. Raw payloads go to image_provider_events.
  error_category text check (
    error_category is null
    or error_category in (
      'transient', 'permanent', 'policy', 'auth', 'budget', 'integrity'
    )
  ),
  error_code text,
  error_message text,

  estimated_cost_jpy numeric(10,2) not null default 0,
  actual_cost_jpy numeric(10,2),

  expires_at timestamptz not null default (now() + interval '2 hours'),

  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Worker pickup path
create index if not exists image_jobs_pickup_idx
  on public.image_generation_jobs (status, next_attempt_at)
  where status in ('queued', 'submitted', 'running', 'succeeded');

create index if not exists image_jobs_provider_job_idx
  on public.image_generation_jobs (provider, provider_job_id);

create index if not exists image_jobs_concept_idx
  on public.image_generation_jobs (concept_id);

-- Reaper path: non-terminal jobs past their deadline
create index if not exists image_jobs_expiry_idx
  on public.image_generation_jobs (expires_at)
  where status not in ('stored', 'failed', 'cancelled', 'expired');

-- ---------------------------------------------------------------------------
-- image_generation_results : one produced image. This is the review unit.
-- ---------------------------------------------------------------------------
create table if not exists public.image_generation_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.image_generation_jobs(id) on delete cascade,
  variant_index smallint not null,

  -- Provider CDN URL. Expires, so it is reference data only.
  source_url text,
  source_url_expires_at timestamptz,

  -- Private bucket location. This is the authoritative copy.
  storage_bucket text,
  storage_path text,
  width integer,
  height integer,
  content_type text,
  bytes integer,
  checksum text,

  -- Set when this one image failed to ingest while siblings succeeded.
  download_error text,

  -- Claude stage 3. Input for the human reviewer, never an auto-approval.
  qa_verdict text check (
    qa_verdict is null or qa_verdict in ('recommend', 'borderline', 'reject')
  ),
  qa_scores jsonb,
  qa_issues jsonb not null default '[]'::jsonb,
  alt_text_ja text,
  alt_text_en text,
  caption_draft text,

  review_state public.image_review_state not null default 'pending_review',
  reviewed_by text,
  reviewed_at timestamptz,
  review_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, variant_index)
);

create index if not exists image_results_review_idx
  on public.image_generation_results (review_state, created_at desc);

create index if not exists image_results_job_idx
  on public.image_generation_results (job_id);

-- ---------------------------------------------------------------------------
-- image_assets : approved, copied to a public bucket
--   Attaching to product_images / site_content is a separate later action.
-- ---------------------------------------------------------------------------
create table if not exists public.image_assets (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null unique
    references public.image_generation_results(id) on delete restrict,
  purpose public.image_purpose not null,
  subject_class public.image_subject_class not null,

  -- An image_assets row means "copied to a public bucket", so an
  -- internal_test row cannot exist. The DB refuses it even if the
  -- application layer has a bug.
  release_policy public.image_release_policy not null default 'production'
    check (release_policy = 'production'),

  public_bucket text not null,
  public_path text not null,
  public_url text not null,
  alt_text_ja text not null default '',
  alt_text_en text not null default '',

  -- Provenance. Recorded, never used to gate approval.
  is_ai_generated boolean not null default true,
  generation_provider text not null,
  license_note text not null default '',

  attached_product_id uuid references public.products(id) on delete set null,
  attached_fabric_slug text references public.fabrics(slug) on delete set null,
  attached_content_key text,

  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists image_assets_purpose_idx
  on public.image_assets (purpose, created_at desc);

create index if not exists image_assets_attached_product_idx
  on public.image_assets (attached_product_id);

-- ---------------------------------------------------------------------------
-- image_review_events : approval audit log (append only)
-- ---------------------------------------------------------------------------
create table if not exists public.image_review_events (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null
    references public.image_generation_results(id) on delete cascade,
  action text not null check (
    action in ('approve', 'reject', 'request_revision', 'publish', 'unpublish')
  ),
  from_state public.image_review_state,
  to_state public.image_review_state,
  -- 'admin' today; 'agent:claude' for agent approvals of internal_test work.
  actor text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists image_review_events_result_idx
  on public.image_review_events (result_id, created_at);

-- ---------------------------------------------------------------------------
-- image_provider_events : raw webhook / poll payloads, and webhook dedupe
-- ---------------------------------------------------------------------------
create table if not exists public.image_provider_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.image_generation_jobs(id) on delete cascade,
  provider text not null,
  provider_event_id text,
  source text not null check (source in ('webhook', 'poll', 'submit')),
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- A redelivered webhook is processed once
create unique index if not exists image_provider_events_dedupe_idx
  on public.image_provider_events (provider, provider_event_id)
  where provider_event_id is not null;

create index if not exists image_provider_events_job_idx
  on public.image_provider_events (job_id, received_at desc);

-- ---------------------------------------------------------------------------
-- image_cost_ledger : evidence for the monthly budget circuit breaker
-- ---------------------------------------------------------------------------
create table if not exists public.image_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.image_generation_jobs(id) on delete set null,
  kind text not null check (kind in ('claude', 'image_provider')),
  provider text not null,
  amount_jpy numeric(10,2) not null,
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists image_cost_ledger_occurred_idx
  on public.image_cost_ledger (occurred_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'image_briefs_set_updated_at'
  ) then
    create trigger image_briefs_set_updated_at
      before update on public.image_briefs
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'image_concepts_set_updated_at'
  ) then
    create trigger image_concepts_set_updated_at
      before update on public.image_concepts
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'image_generation_jobs_set_updated_at'
  ) then
    create trigger image_generation_jobs_set_updated_at
      before update on public.image_generation_jobs
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'image_generation_results_set_updated_at'
  ) then
    create trigger image_generation_results_set_updated_at
      before update on public.image_generation_results
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- claim_image_jobs : lease jobs for a worker
--
-- The Supabase JS client cannot express SELECT ... FOR UPDATE SKIP LOCKED,
-- so the worker calls this through rpc(). Overlapping cron runs and a
-- parallel external scheduler can both call it without double-processing.
-- ---------------------------------------------------------------------------
create or replace function public.claim_image_jobs(
  p_worker_id text,
  p_statuses public.image_job_status[],
  p_limit integer default 5,
  p_lease_seconds integer default 120
)
returns setof public.image_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select j.id
    from public.image_generation_jobs j
    where j.status = any(p_statuses)
      and j.next_attempt_at <= now()
      and (j.lease_expires_at is null or j.lease_expires_at < now())
    order by j.next_attempt_at
    limit greatest(p_limit, 0)
    for update skip locked
  )
  update public.image_generation_jobs j
     set claimed_by = p_worker_id,
         claimed_at = now(),
         lease_expires_at = now() + make_interval(secs => p_lease_seconds)
    from picked
   where j.id = picked.id
  returning j.*;
end;
$$;

-- Only the service role reaches this; revoke from the PostgREST-exposed roles.
-- anon/authenticated are created by Supabase and absent on a plain Postgres,
-- so each revoke is guarded to keep this migration portable.
revoke all on function public.claim_image_jobs(
  text, public.image_job_status[], integer, integer
) from public;

do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format(
        'revoke all on function public.claim_image_jobs('
        || 'text, public.image_job_status[], integer, integer) from %I',
        r
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RLS
--
-- Left disabled, matching the rest of this schema: every access path goes
-- through the service-role client behind the admin session. When the admin
-- moves to Supabase Auth, enable RLS on all image_* tables and grant nothing
-- to anon/authenticated -- the only public surface is image_assets.public_url,
-- which is served by the public storage bucket, not by these tables.
-- ---------------------------------------------------------------------------


-- ===========================================================================
-- add-image-reference-sets.sql
-- ===========================================================================

-- Brand reference image sets.
--
-- Consistency is what makes a feed read as a brand. A single strong image
-- is worth little if the next post looks like it came from somewhere else,
-- so FLUX 2 Pro's multi-reference support is attached to every production
-- job rather than chosen per brief: picking references by hand each time is
-- exactly how a series drifts.
--
-- Referenced images must be publicly fetchable by the provider, so a set
-- points at approved assets or existing site images, never at the private
-- drafts bucket.
--
-- See docs/image-generation-workflow.md §6.1.1.

create table if not exists public.image_reference_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',

  -- Exactly one set is applied automatically to production jobs.
  is_default boolean not null default false,

  -- Which purposes this set applies to. Empty means all of them.
  purposes public.image_purpose[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one default set
create unique index if not exists image_reference_sets_one_default
  on public.image_reference_sets (is_default)
  where is_default = true;

create table if not exists public.image_reference_images (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null
    references public.image_reference_sets(id) on delete cascade,

  -- Must be publicly reachable: the provider fetches it.
  url text not null,
  -- Present when the reference is itself an approved generation.
  asset_id uuid references public.image_assets(id) on delete set null,

  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists image_reference_images_set_idx
  on public.image_reference_images (set_id, sort_order);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'image_reference_sets_set_updated_at'
  ) then
    create trigger image_reference_sets_set_updated_at
      before update on public.image_reference_sets
      for each row execute function public.set_updated_at();
  end if;
end $$;


-- ===========================================================================
-- add-integration-outbox.sql
-- ===========================================================================

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


-- ---------------------------------------------------------------------------
-- 画像パイプライン 4 本も適用済みとして記録
-- ---------------------------------------------------------------------------
insert into public.schema_migrations (name) values
  ('add-ai-image-drafts-bucket.sql'),
  ('add-image-generation.sql'),
  ('add-image-reference-sets.sql'),
  ('add-integration-outbox.sql')
on conflict (name) do nothing;
