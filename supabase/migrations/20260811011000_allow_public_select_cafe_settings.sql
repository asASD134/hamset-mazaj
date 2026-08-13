-- Migration: Allow public SELECT on cafe_settings while keeping UPDATE restricted
-- Note: This file is created locally only. Do NOT apply without review.

-- Create a policy that allows SELECT for all roles (public read-only)
create policy if not exists cafe_settings_select_public
  on public.cafe_settings
  for select
  using (true);

-- Ensure UPDATE policy remains restricted to authenticated users (do not modify it here)

-- End of migration (local file only). Do not run automatically.
