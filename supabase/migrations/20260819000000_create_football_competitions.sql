-- Football competitions selected from the BSD provider.
create table if not exists public.football_competitions (
  id bigint primary key,
  name text not null,
  name_ar text,
  country text,
  competition_type text not null default 'league'
    check (competition_type in ('league', 'cup', 'competition')),
  logo_url text,
  is_active boolean not null default false,
  sort_order integer not null default 1000,
  match_limit integer not null default 4
    check (match_limit between 1 and 20),
  provider_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists football_competitions_active_sort_idx
  on public.football_competitions (is_active, sort_order, id);

alter table public.football_competitions enable row level security;

drop policy if exists football_competitions_select_active
  on public.football_competitions;
drop policy if exists football_competitions_select_admin
  on public.football_competitions;
drop policy if exists football_competitions_insert_admin
  on public.football_competitions;
drop policy if exists football_competitions_update_admin
  on public.football_competitions;
drop policy if exists football_competitions_delete_admin
  on public.football_competitions;

create policy football_competitions_select_active
  on public.football_competitions
  for select
  to anon, authenticated
  using (is_active = true);

create policy football_competitions_select_admin
  on public.football_competitions
  for select
  to authenticated
  using (public.is_admin());

create policy football_competitions_insert_admin
  on public.football_competitions
  for insert
  to authenticated
  with check (public.is_admin());

create policy football_competitions_update_admin
  on public.football_competitions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy football_competitions_delete_admin
  on public.football_competitions
  for delete
  to authenticated
  using (public.is_admin());

create or replace function public.touch_football_competitions_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists football_competitions_touch_updated_at
  on public.football_competitions;

create trigger football_competitions_touch_updated_at
before update on public.football_competitions
for each row
execute function public.touch_football_competitions_updated_at();

grant select on public.football_competitions to anon, authenticated;
grant insert, update, delete on public.football_competitions to authenticated;
