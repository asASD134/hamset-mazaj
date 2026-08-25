alter table public.site_control
  add column if not exists show_site_name boolean not null default true,
  add column if not exists show_tagline boolean not null default true,
  add column if not exists show_site_description boolean not null default true,
  add column if not exists show_logo boolean not null default true,

  add column if not exists show_hero_badge boolean not null default true,
  add column if not exists show_hero_title boolean not null default true,
  add column if not exists show_hero_subtitle boolean not null default true,
  add column if not exists show_hero_description boolean not null default true,
  add column if not exists show_hero_background boolean not null default true,
  add column if not exists show_hero_primary_button boolean not null default true,
  add column if not exists show_hero_secondary_button boolean not null default true,

  add column if not exists show_featured_badge boolean not null default true,
  add column if not exists show_featured_title boolean not null default true,
  add column if not exists show_featured_description boolean not null default true,
  add column if not exists show_featured_products boolean not null default true,
  add column if not exists show_featured_prices boolean not null default true,
  add column if not exists show_featured_button boolean not null default true,

  add column if not exists show_why_title boolean not null default true,
  add column if not exists show_why_description boolean not null default true,
  add column if not exists show_why_features boolean not null default true,

  add column if not exists show_matches_title boolean not null default true,
  add column if not exists show_matches_description boolean not null default true,
  add column if not exists show_matches_list boolean not null default true,
  add column if not exists show_matches_button boolean not null default true,

  add column if not exists show_gallery_title boolean not null default true,
  add column if not exists show_gallery_description boolean not null default true,
  add column if not exists show_gallery_images boolean not null default true,
  add column if not exists show_gallery_button boolean not null default true,

  add column if not exists show_testimonials_title boolean not null default true,
  add column if not exists show_testimonials_description boolean not null default true,
  add column if not exists show_testimonials_list boolean not null default true,

  add column if not exists show_contact_title boolean not null default true,
  add column if not exists show_contact_description boolean not null default true,
  add column if not exists show_contact_address boolean not null default true,
  add column if not exists show_contact_phone boolean not null default true,
  add column if not exists show_contact_hours boolean not null default true,
  add column if not exists show_contact_map boolean not null default true,
  add column if not exists show_contact_social_links boolean not null default true,

  add column if not exists show_footer_description boolean not null default true,
  add column if not exists show_footer_links boolean not null default true,
  add column if not exists show_footer_contact boolean not null default true,
  add column if not exists show_footer_social_links boolean not null default true,
  add column if not exists show_footer_copyright boolean not null default true;

drop policy if exists site_control_select_public
on public.site_control;

create policy site_control_select_public
on public.site_control
for select
to anon, authenticated
using (true);

drop policy if exists site_control_update_admin
on public.site_control;

create policy site_control_update_admin
on public.site_control
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke update
on public.site_control
from anon;

grant select
on public.site_control
to anon, authenticated;

grant update
on public.site_control
to authenticated;

notify pgrst, 'reload schema';