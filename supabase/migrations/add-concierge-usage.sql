-- Gauge Concierge: daily budget for paid model calls.
-- One row per day (Japan time). No conversation text, no customer data —
-- only a count. Safe to re-run.
create table if not exists public.concierge_daily_usage (
  day date primary key,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

-- No anon/authenticated access. Only the service role (server-side API
-- route) reads or writes.
alter table public.concierge_daily_usage enable row level security;

-- Atomic "count one more call if today's limit allows it".
-- Returns true when the call was counted, false when the budget is spent.
-- The insert/update is a single statement, so concurrent requests cannot
-- both take the last slot.
create or replace function public.consume_concierge_budget(
  p_limit integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Tokyo')::date;
  v_count integer;
begin
  if p_limit is null or p_limit < 1 then
    return false;
  end if;

  insert into public.concierge_daily_usage as d (day, request_count)
  values (v_day, 1)
  on conflict (day) do update
    set request_count = d.request_count + 1,
        updated_at = now()
    where d.request_count < p_limit
  returning d.request_count into v_count;

  return v_count is not null;
end;
$$;

-- Only the service role reaches this; revoke from the PostgREST-exposed
-- roles. Guarded so the migration also runs on plain Postgres.
revoke all on function public.consume_concierge_budget(integer) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.consume_concierge_budget(integer) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.consume_concierge_budget(integer) from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.consume_concierge_budget(integer) to service_role';
  end if;
end;
$$;
