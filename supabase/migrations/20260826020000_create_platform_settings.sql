create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  primary_color text not null default '#EAB308',
  background_color text not null default '#0A0A0A',
  surface_color text not null default '#121212',
  global_typography jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists platform_settings_public_read on public.platform_settings;
drop policy if exists platform_settings_system_admin_write on public.platform_settings;

create policy platform_settings_public_read
  on public.platform_settings for select to anon, authenticated
  using (true);

create policy platform_settings_system_admin_write
  on public.platform_settings for all to authenticated
  using (public.is_system_admin())
  with check (public.is_system_admin());

insert into public.platform_settings (singleton)
values (true)
on conflict (singleton) do nothing;
