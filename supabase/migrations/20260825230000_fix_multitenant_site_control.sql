-- Fix site-control multi-tenancy after the original singleton index.
-- The original site_control table created a singleton unique index on (true),
-- which prevented every cafe after the first one from getting its own row.
-- That made homepage settings fail to save for the test cafe.

drop index if exists public.site_control_single_row_idx;

-- Ensure every active cafe has exactly one site_control row.
insert into public.site_control (cafe_id, site_name)
select c.id, c.name
from public.cafes c
where not exists (
  select 1
  from public.site_control sc
  where sc.cafe_id = c.id
)
on conflict (cafe_id) do nothing;

-- Keep the tenant uniqueness guarantee explicit.
create unique index if not exists site_control_cafe_id_key
  on public.site_control(cafe_id);

-- Re-assert the tenant-aware RLS policy used by the application.
drop policy if exists site_control_public_read on public.site_control;
drop policy if exists site_control_manager_write on public.site_control;

create policy site_control_public_read
  on public.site_control for select to anon, authenticated
  using (exists (
    select 1
    from public.cafes c
    where c.id = cafe_id
      and c.is_active
  ));

create policy site_control_manager_write
  on public.site_control for all to authenticated
  using (public.is_cafe_manager(cafe_id))
  with check (public.is_cafe_manager(cafe_id));
