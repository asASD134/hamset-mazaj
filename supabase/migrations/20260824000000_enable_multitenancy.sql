-- Hamset Mazaj SaaS / Multi-Tenant foundation
-- Safe to re-run. Keeps the current Hamset Mazaj data as the first cafe.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Ensure system-admin role and default cafe exist
-- ------------------------------------------------------------

insert into public.user_roles (user_id, role)
select id, 'system_admin'
from public.admin_users
order by created_at
limit 1
on conflict (user_id) do update set role = excluded.role;

insert into public.cafes (name, slug, owner_user_id, is_active)
select 'همسة مزاج', 'hamset-mazaj', au.id, true
from public.admin_users au
where not exists (select 1 from public.cafes)
order by au.created_at
limit 1;

-- In case cafes already existed but the default cafe did not.
insert into public.cafes (name, slug, owner_user_id, is_active)
select 'همسة مزاج', 'hamset-mazaj', au.id, true
from public.admin_users au
where not exists (select 1 from public.cafes where slug = 'hamset-mazaj')
order by au.created_at
limit 1;

-- ------------------------------------------------------------
-- 2) Add tenant keys to business tables
-- ------------------------------------------------------------

alter table public.cafe_settings add column if not exists cafe_id uuid;
alter table public.site_control add column if not exists cafe_id uuid;
alter table public.categories add column if not exists cafe_id uuid;
alter table public.menu add column if not exists cafe_id uuid;
alter table public.tables add column if not exists cafe_id uuid;
alter table public.orders add column if not exists cafe_id uuid;
alter table public.service_requests add column if not exists cafe_id uuid;

-- ------------------------------------------------------------
-- 3) Backfill current rows into the Hamset Mazaj tenant
-- ------------------------------------------------------------

do $$
declare
  v_cafe_id uuid;
begin
  select id into v_cafe_id
  from public.cafes
  where slug = 'hamset-mazaj'
  limit 1;

  if v_cafe_id is null then
    raise exception 'Default Hamset Mazaj cafe could not be created';
  end if;

  update public.cafe_settings
  set cafe_id = v_cafe_id
  where cafe_id is null;

  update public.site_control
  set cafe_id = v_cafe_id
  where cafe_id is null;

  update public.categories
  set cafe_id = v_cafe_id
  where cafe_id is null;

  update public.menu
  set cafe_id = v_cafe_id
  where cafe_id is null;

  update public.tables
  set cafe_id = v_cafe_id
  where cafe_id is null;

  update public.orders
  set cafe_id = v_cafe_id
  where cafe_id is null;

  update public.service_requests
  set cafe_id = v_cafe_id
  where cafe_id is null;

  insert into public.cafe_members (cafe_id, user_id, role)
  select v_cafe_id, au.id, 'owner'
  from public.admin_users au
  where not exists (
    select 1 from public.cafe_members cm
    where cm.cafe_id = v_cafe_id and cm.user_id = au.id
  )
  order by au.created_at
  limit 1;
end $$;

-- ------------------------------------------------------------
-- 4) Tenant foreign keys and uniqueness
-- ------------------------------------------------------------

alter table public.cafe_settings
  drop constraint if exists cafe_settings_cafe_id_fkey;
alter table public.cafe_settings
  add constraint cafe_settings_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.site_control
  drop constraint if exists site_control_cafe_id_fkey;
alter table public.site_control
  add constraint site_control_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.categories
  drop constraint if exists categories_cafe_id_fkey;
alter table public.categories
  add constraint categories_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.menu
  drop constraint if exists menu_cafe_id_fkey;
alter table public.menu
  add constraint menu_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.tables
  drop constraint if exists tables_cafe_id_fkey;
alter table public.tables
  add constraint tables_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.orders
  drop constraint if exists orders_cafe_id_fkey;
alter table public.orders
  add constraint orders_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.service_requests
  drop constraint if exists service_requests_cafe_id_fkey;
alter table public.service_requests
  add constraint service_requests_cafe_id_fkey
  foreign key (cafe_id) references public.cafes(id) on delete cascade;

alter table public.cafe_settings alter column cafe_id set not null;
alter table public.site_control alter column cafe_id set not null;
alter table public.categories alter column cafe_id set not null;
alter table public.menu alter column cafe_id set not null;
alter table public.tables alter column cafe_id set not null;
alter table public.orders alter column cafe_id set not null;
alter table public.service_requests alter column cafe_id set not null;

create unique index if not exists cafe_settings_cafe_id_key on public.cafe_settings(cafe_id);
create unique index if not exists site_control_cafe_id_key on public.site_control(cafe_id);
create index if not exists categories_cafe_id_idx on public.categories(cafe_id, sort_order);
create index if not exists menu_cafe_id_idx on public.menu(cafe_id, category_id, sort_order);
create index if not exists tables_cafe_id_idx on public.tables(cafe_id, table_number);
create index if not exists orders_cafe_id_created_at_idx on public.orders(cafe_id, created_at desc);
create index if not exists service_requests_cafe_id_created_at_idx on public.service_requests(cafe_id, created_at desc);

-- Table numbers are unique within a cafe, not globally.
alter table public.tables drop constraint if exists tables_table_number_key;
alter table public.tables drop constraint if exists tables_table_number_unique;
create unique index if not exists tables_cafe_table_number_key on public.tables(cafe_id, table_number);

-- ------------------------------------------------------------
-- 5) Remove singleton behavior from cafe_settings
-- ------------------------------------------------------------

drop trigger if exists cafe_settings_singleton_trigger on public.cafe_settings;
drop function if exists public.cafe_settings_singleton();

-- ------------------------------------------------------------
-- 6) Role helpers
-- ------------------------------------------------------------

create or replace function public.is_system_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'system_admin'
  );
$$;

create or replace function public.current_cafe_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.cafes c
  where c.is_active
    and public.is_system_admin()
  union
  select cm.cafe_id
  from public.cafe_members cm
  join public.cafes c on c.id = cm.cafe_id and c.is_active
  where cm.user_id = (select auth.uid());
$$;

create or replace function public.is_cafe_manager(p_cafe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_system_admin()
  or exists (
    select 1
    from public.cafe_members cm
    where cm.cafe_id = p_cafe_id
      and cm.user_id = (select auth.uid())
      and cm.role in ('owner','manager')
  );
$$;

revoke all on function public.is_system_admin() from public;
revoke all on function public.current_cafe_ids() from public;
revoke all on function public.is_cafe_manager(uuid) from public;
grant execute on function public.is_system_admin() to anon, authenticated;
grant execute on function public.current_cafe_ids() to anon, authenticated;
grant execute on function public.is_cafe_manager(uuid) to authenticated;

-- ------------------------------------------------------------
-- 7) RLS - platform tables
-- ------------------------------------------------------------

alter table public.cafes enable row level security;
alter table public.cafe_members enable row level security;
alter table public.user_roles enable row level security;

-- Cafes
 drop policy if exists "cafe members can read their cafe" on public.cafes;
 drop policy if exists "system admins manage cafes" on public.cafes;
create policy "public can read active cafes"
  on public.cafes for select to anon, authenticated
  using (is_active = true);
create policy "system admins manage cafes"
  on public.cafes for all to authenticated
  using (public.is_system_admin())
  with check (public.is_system_admin());

-- Members
 drop policy if exists "system admins manage cafe members" on public.cafe_members;
 drop policy if exists "users can read own cafe membership" on public.cafe_members;
create policy "members can read own membership"
  on public.cafe_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_system_admin());
create policy "system admins manage cafe members"
  on public.cafe_members for all to authenticated
  using (public.is_system_admin())
  with check (public.is_system_admin());

-- System roles
 drop policy if exists "system admins manage roles" on public.user_roles;
 drop policy if exists "users can read own role" on public.user_roles;
create policy "users can read own role"
  on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "system admins manage roles"
  on public.user_roles for all to authenticated
  using (public.is_system_admin())
  with check (public.is_system_admin());

-- ------------------------------------------------------------
-- 8) RLS - tenant tables
-- ------------------------------------------------------------

alter table public.cafe_settings enable row level security;
alter table public.site_control enable row level security;
alter table public.categories enable row level security;
alter table public.menu enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.service_requests enable row level security;

-- Cafe settings
 drop policy if exists cafe_settings_select_anon on public.cafe_settings;
 drop policy if exists cafe_settings_select_authenticated on public.cafe_settings;
 drop policy if exists cafe_settings_update_authenticated on public.cafe_settings;
 drop policy if exists cafe_settings_update_admin on public.cafe_settings;
create policy cafe_settings_public_read
  on public.cafe_settings for select to anon, authenticated
  using (exists (select 1 from public.cafes c where c.id = cafe_id and c.is_active));
create policy cafe_settings_manager_write
  on public.cafe_settings for update to authenticated
  using (public.is_cafe_manager(cafe_id))
  with check (public.is_cafe_manager(cafe_id));

-- Site control
 drop policy if exists site_control_select_public on public.site_control;
 drop policy if exists site_control_insert_admin on public.site_control;
 drop policy if exists site_control_update_admin on public.site_control;
create policy site_control_public_read
  on public.site_control for select to anon, authenticated
  using (exists (select 1 from public.cafes c where c.id = cafe_id and c.is_active));
create policy site_control_manager_write
  on public.site_control for all to authenticated
  using (public.is_cafe_manager(cafe_id))
  with check (public.is_cafe_manager(cafe_id));

-- Categories / menu / tables
 drop policy if exists "Enable read access for all users" on public.categories;
 drop policy if exists categories_select on public.categories;
 drop policy if exists categories_insert on public.categories;
 drop policy if exists categories_update on public.categories;
 drop policy if exists categories_delete on public.categories;
create policy categories_public_read
  on public.categories for select to anon, authenticated
  using (exists (select 1 from public.cafes c where c.id = cafe_id and c.is_active));
create policy categories_manager_write
  on public.categories for all to authenticated
  using (public.is_cafe_manager(cafe_id))
  with check (public.is_cafe_manager(cafe_id));

 drop policy if exists "Enable read access for all users" on public.menu;
 drop policy if exists menu_select on public.menu;
 drop policy if exists menu_insert on public.menu;
 drop policy if exists menu_update on public.menu;
 drop policy if exists menu_delete on public.menu;
 drop policy if exists menu_insert_admin on public.menu;
 drop policy if exists menu_update_admin on public.menu;
 drop policy if exists menu_delete_admin on public.menu;
create policy menu_public_read
  on public.menu for select to anon, authenticated
  using (exists (select 1 from public.cafes c where c.id = cafe_id and c.is_active));
create policy menu_manager_write
  on public.menu for all to authenticated
  using (public.is_cafe_manager(cafe_id))
  with check (public.is_cafe_manager(cafe_id));

 drop policy if exists tables_select_public on public.tables;
 drop policy if exists tables_insert_admin on public.tables;
 drop policy if exists tables_update_admin on public.tables;
 drop policy if exists tables_delete_admin on public.tables;
create policy tables_public_read
  on public.tables for select to anon, authenticated
  using (exists (select 1 from public.cafes c where c.id = cafe_id and c.is_active));
create policy tables_manager_write
  on public.tables for all to authenticated
  using (public.is_cafe_manager(cafe_id))
  with check (public.is_cafe_manager(cafe_id));

-- Orders: customer creates orders through the RPC; staff read/update their own cafe.
 drop policy if exists "Allow anyone to insert orders" on public.orders;
 drop policy if exists "Allow authenticated users to read orders" on public.orders;
 drop policy if exists "Allow authenticated users to update orders" on public.orders;
 drop policy if exists orders_insert on public.orders;
 drop policy if exists orders_select on public.orders;
 drop policy if exists orders_update on public.orders;
create policy orders_staff_read
  on public.orders for select to authenticated
  using (cafe_id in (select public.current_cafe_ids()));
create policy orders_staff_update
  on public.orders for update to authenticated
  using (cafe_id in (select public.current_cafe_ids()))
  with check (cafe_id in (select public.current_cafe_ids()));

-- Order items inherit access through orders.
 drop policy if exists items_insert on public.order_items;
 drop policy if exists items_select on public.order_items;
create policy items_staff_read
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.cafe_id in (select public.current_cafe_ids())
  ));

-- Service requests
 drop policy if exists "Allow anyone to read service requests" on public.service_requests;
 drop policy if exists "Allow anyone to update service requests" on public.service_requests;
 drop policy if exists "Allow anyone to insert service requests" on public.service_requests;
create policy service_requests_public_insert
  on public.service_requests for insert to anon, authenticated
  with check (exists (
    select 1 from public.cafes c where c.id = cafe_id and c.is_active
  ));
create policy service_requests_staff_read
  on public.service_requests for select to authenticated
  using (cafe_id in (select public.current_cafe_ids()));
create policy service_requests_staff_update
  on public.service_requests for update to authenticated
  using (cafe_id in (select public.current_cafe_ids()))
  with check (cafe_id in (select public.current_cafe_ids()));

-- ------------------------------------------------------------
-- 9) Tenant-aware order creation RPC
-- ------------------------------------------------------------

drop function if exists public.create_order_with_items(integer, uuid, jsonb);
drop function if exists public.create_order_with_items(uuid, integer, uuid, jsonb);

create or replace function public.create_order_with_items(
  p_cafe_id uuid,
  p_table_number integer,
  p_client_request_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_table_id bigint;
  v_table_status text;
  v_order_id bigint;
  v_total_price numeric := 0;
  v_order_status text;
  v_created_at timestamptz;
  v_item jsonb;
  v_menu_id bigint;
  v_menu_price numeric;
  v_quantity integer;
begin
  if p_cafe_id is null then raise exception 'Cafe is required'; end if;
  if p_client_request_id is null then raise exception 'Client request ID is required'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if not exists (select 1 from public.cafes c where c.id = p_cafe_id and c.is_active) then
    raise exception 'Cafe not found';
  end if;

  select t.id, t.status into v_table_id, v_table_status
  from public.tables t
  where t.cafe_id = p_cafe_id and t.table_number = p_table_number;

  if v_table_id is null then raise exception 'Table not found'; end if;
  if v_table_status <> 'available' then raise exception 'Table is not available'; end if;

  select o.id, o.total_price, o.status, o.created_at
  into v_order_id, v_total_price, v_order_status, v_created_at
  from public.orders o
  where o.client_request_id = p_client_request_id and o.cafe_id = p_cafe_id;

  if v_order_id is not null then
    return jsonb_build_object('order_id', v_order_id, 'total_price', v_total_price, 'status', v_order_status, 'created_at', v_created_at, 'duplicate', true);
  end if;

  insert into public.orders (cafe_id, table_id, total_price, status, client_request_id)
  values (p_cafe_id, v_table_id, 0, 'pending', p_client_request_id)
  on conflict (client_request_id) do nothing
  returning id, status, created_at into v_order_id, v_order_status, v_created_at;

  if v_order_id is null then
    select o.id, o.total_price, o.status, o.created_at into v_order_id, v_total_price, v_order_status, v_created_at
    from public.orders o where o.client_request_id = p_client_request_id;
    return jsonb_build_object('order_id', v_order_id, 'total_price', v_total_price, 'status', v_order_status, 'created_at', v_created_at, 'duplicate', true);
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' or not (v_item ? 'menu_id') or not (v_item ? 'quantity') then
      raise exception 'Each cart item must include menu_id and quantity';
    end if;

    v_menu_id := (v_item ->> 'menu_id')::bigint;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if;

    select m.price into v_menu_price
    from public.menu m
    where m.id = v_menu_id and m.cafe_id = p_cafe_id and m.is_available = true;

    if not found then raise exception 'Menu item not found or unavailable'; end if;

    insert into public.order_items (order_id, menu_id, quantity, price, total_price)
    values (v_order_id, v_menu_id, v_quantity, v_menu_price, v_menu_price * v_quantity);

    v_total_price := v_total_price + (v_menu_price * v_quantity);
  end loop;

  update public.orders set total_price = v_total_price where id = v_order_id;

  return jsonb_build_object('order_id', v_order_id, 'total_price', v_total_price, 'status', v_order_status, 'created_at', v_created_at, 'duplicate', false);
end;
$$;

revoke all on function public.create_order_with_items(uuid, integer, uuid, jsonb) from public;
grant execute on function public.create_order_with_items(uuid, integer, uuid, jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- 10) Seed missing per-cafe settings rows for any additional cafes
-- ------------------------------------------------------------

insert into public.cafe_settings (cafe_id, cafe_name, is_open)
select c.id, c.name, true
from public.cafes c
where not exists (select 1 from public.cafe_settings s where s.cafe_id = c.id);

insert into public.site_control (cafe_id, site_name)
select c.id, c.name
from public.cafes c
where not exists (select 1 from public.site_control s where s.cafe_id = c.id);
