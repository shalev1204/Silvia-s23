-- Cloud save for the Hub (docs/IDEAS_BACKLOG.md, ideas #19 and #22).
-- The browser only uses the public (publishable/anon) key, which is visible in the repo, so:
--   * anon may INSERT saves and events, and nothing else (no select, update or delete);
--   * a new browser recovers its seeker's journey through eclipse_latest_save(), which returns one snapshot;
--   * Claude (Supabase connector) and the Operator read everything with private access.

create table if not exists public.eclipse_saves (
  id          bigint generated always as identity primary key,
  seeker      text        not null check (seeker in ('silvia', 'carles')),
  saved_at    timestamptz not null default now(),
  client_at   timestamptz,
  hub_version text,
  progress    jsonb       not null check (jsonb_typeof(progress) = 'object'),
  constraint eclipse_saves_size check (octet_length(progress::text) < 2000000)
);
create index if not exists eclipse_saves_seeker_time on public.eclipse_saves (seeker, saved_at desc);

create table if not exists public.eclipse_events (
  id          bigint generated always as identity primary key,
  seeker      text        not null check (seeker in ('silvia', 'carles')),
  received_at timestamptz not null default now(),
  client_at   timestamptz not null,
  kind        text        not null check (kind in ('key', 'session', 'view')),
  key         text        check (char_length(key) <= 200),
  value       text        check (char_length(value) <= 4000),
  removed     boolean     not null default false
);
create index if not exists eclipse_events_seeker_time on public.eclipse_events (seeker, client_at);

alter table public.eclipse_saves  enable row level security;
alter table public.eclipse_events enable row level security;

drop policy if exists eclipse_saves_insert  on public.eclipse_saves;
drop policy if exists eclipse_events_insert on public.eclipse_events;
create policy eclipse_saves_insert  on public.eclipse_saves  for insert to anon with check (seeker in ('silvia', 'carles'));
create policy eclipse_events_insert on public.eclipse_events for insert to anon with check (seeker in ('silvia', 'carles'));

revoke all on public.eclipse_saves, public.eclipse_events from anon, authenticated;
grant insert on public.eclipse_saves, public.eclipse_events to anon;

-- The only thing a browser can read: the latest snapshot of one seeker
create or replace function public.eclipse_latest_save(p_seeker text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('saved_at', s.saved_at, 'progress', s.progress)
  from public.eclipse_saves s
  where s.seeker = p_seeker
  order by s.saved_at desc, s.id desc
  limit 1;
$$;
-- Supabase grants execute on new functions to anon and authenticated by name, not only through public
revoke all on function public.eclipse_latest_save(text) from public, anon, authenticated;
grant execute on function public.eclipse_latest_save(text) to anon;

-- Keep the table small: the latest 300 snapshots of each seeker, plus one per day for the history
create or replace function public.eclipse_prune_saves()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.eclipse_saves s
  where s.seeker = new.seeker
    and s.id not in (
      select id from public.eclipse_saves where seeker = new.seeker order by saved_at desc, id desc limit 300
    )
    and s.id not in (
      select distinct on (date_trunc('day', saved_at)) id
      from public.eclipse_saves where seeker = new.seeker
      order by date_trunc('day', saved_at), saved_at desc, id desc
    );
  return null;
end;
$$;
drop trigger if exists eclipse_saves_prune on public.eclipse_saves;
revoke all on function public.eclipse_prune_saves() from public, anon, authenticated;
create trigger eclipse_saves_prune after insert on public.eclipse_saves
  for each row execute function public.eclipse_prune_saves();
