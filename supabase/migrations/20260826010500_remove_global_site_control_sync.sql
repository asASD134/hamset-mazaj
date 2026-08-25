-- Cafe settings must remain tenant-local.
-- Shared behavior comes from the application code/template, not by copying
-- one cafe's settings into every other cafe.

drop trigger if exists site_control_global_sync_before_insert on public.site_control;
drop trigger if exists site_control_global_sync_after_write on public.site_control;
drop function if exists public.sync_site_control_globals();
