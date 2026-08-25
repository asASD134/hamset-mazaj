-- =========================================================
-- Secure Admin Permissions
-- =========================================================

-- 1) Create the admin users table.
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from authenticated;


-- 2) Function used by RLS policies to check the current user.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;

grant execute
on function public.is_admin()
to anon, authenticated;


-- 3) Make the current existing account the first admin.
-- The project currently has one existing Auth account.
insert into public.admin_users (id)
select id
from auth.users
order by created_at
limit 1
on conflict (id) do nothing;


-- =========================================================
-- TABLES
-- =========================================================

alter table public.tables enable row level security;

drop policy if exists tables_select_public
on public.tables;

drop policy if exists tables_insert_admin
on public.tables;

drop policy if exists tables_update_admin
on public.tables;

drop policy if exists tables_delete_admin
on public.tables;

create policy tables_select_public
on public.tables
for select
to anon, authenticated
using (true);

create policy tables_insert_admin
on public.tables
for insert
to authenticated
with check (public.is_admin());

create policy tables_update_admin
on public.tables
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy tables_delete_admin
on public.tables
for delete
to authenticated
using (public.is_admin());


-- =========================================================
-- MENU
-- =========================================================

drop policy if exists menu_insert
on public.menu;

drop policy if exists menu_update
on public.menu;

drop policy if exists menu_delete
on public.menu;

create policy menu_insert_admin
on public.menu
for insert
to authenticated
with check (public.is_admin());

create policy menu_update_admin
on public.menu
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy menu_delete_admin
on public.menu
for delete
to authenticated
using (public.is_admin());


-- =========================================================
-- CATEGORIES
-- =========================================================

drop policy if exists categories_insert
on public.categories;

drop policy if exists categories_update
on public.categories;

drop policy if exists categories_delete
on public.categories;

create policy categories_insert_admin
on public.categories
for insert
to authenticated
with check (public.is_admin());

create policy categories_update_admin
on public.categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy categories_delete_admin
on public.categories
for delete
to authenticated
using (public.is_admin());


-- =========================================================
-- CAFE SETTINGS
-- =========================================================

drop policy if exists cafe_settings_update_authenticated
on public.cafe_settings;

create policy cafe_settings_update_admin
on public.cafe_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- SOCIAL LINKS
-- =========================================================

drop policy if exists social_links_insert_authenticated
on public.social_links;

drop policy if exists social_links_update_authenticated
on public.social_links;

drop policy if exists social_links_delete_authenticated
on public.social_links;

create policy social_links_insert_admin
on public.social_links
for insert
to authenticated
with check (public.is_admin());

create policy social_links_update_admin
on public.social_links
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy social_links_delete_admin
on public.social_links
for delete
to authenticated
using (public.is_admin());


-- =========================================================
-- ORDERS
-- =========================================================

drop policy if exists orders_select
on public.orders;

drop policy if exists orders_update
on public.orders;

drop policy if exists "Allow authenticated users to read orders"
on public.orders;

drop policy if exists "Allow authenticated users to update orders"
on public.orders;

create policy orders_select_admin
on public.orders
for select
to authenticated
using (public.is_admin());

create policy orders_update_admin
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- SERVICE REQUESTS
-- =========================================================

drop policy if exists "Allow anyone to read service requests"
on public.service_requests;

drop policy if exists "Allow anyone to update service requests"
on public.service_requests;

create policy service_requests_select_admin
on public.service_requests
for select
to authenticated
using (public.is_admin());

create policy service_requests_update_admin
on public.service_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());