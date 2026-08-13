-- Create cafe_settings table (singleton)
create table if not exists public.cafe_settings (
  id uuid primary key default gen_random_uuid(),
  cafe_name text not null default 'همسة مزاج',
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert a single default row if none exists
insert into public.cafe_settings (cafe_name, is_open)
select 'همسة مزاج', true
where not exists (select 1 from public.cafe_settings);

-- Trigger function to enforce single-row and update timestamps
create or replace function public.cafe_settings_singleton()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    if exists (select 1 from public.cafe_settings) then
      raise exception 'only one row allowed in cafe_settings';
    end if;
    return new;
  elsif (tg_op = 'UPDATE') then
    new.updated_at := now();
    return new;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger cafe_settings_singleton_trigger
  before insert or update on public.cafe_settings
  for each row execute function public.cafe_settings_singleton();

-- Enable RLS and allow authenticated users to SELECT and UPDATE
alter table public.cafe_settings enable row level security;

create policy cafe_settings_select_authenticated
  on public.cafe_settings
  for select
  using (auth.role() = 'authenticated');

create policy cafe_settings_update_authenticated
  on public.cafe_settings
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
