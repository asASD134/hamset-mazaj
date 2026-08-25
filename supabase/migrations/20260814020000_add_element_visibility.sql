-- =========================================================
-- Fix site_control update permissions
-- =========================================================

-- 1) التأكد من أن الدالة موجودة
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

revoke all
on function public.is_admin()
from public;

grant execute
on function public.is_admin()
to authenticated;


-- 2) إعادة إنشاء سياسة التحديث
drop policy if exists site_control_update_admin
on public.site_control;

create policy site_control_update_admin
on public.site_control
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- 3) التأكد من صلاحية UPDATE
grant select, update
on public.site_control
to authenticated;