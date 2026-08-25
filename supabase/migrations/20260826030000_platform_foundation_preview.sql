alter table public.platform_settings add column if not exists foundation jsonb not null default '{}'::jsonb;
alter table public.platform_settings add column if not exists preview_assets jsonb not null default '{}'::jsonb;
alter table public.platform_settings add column if not exists version text not null default '1.0.0';

update public.platform_settings ps
set foundation = jsonb_build_object(
  'primary_color', ps.primary_color,
  'background_color', ps.background_color,
  'surface_color', ps.surface_color,
  'typography', coalesce(ps.global_typography, '{}'::jsonb)
)
where ps.foundation = '{}'::jsonb;

update public.platform_settings ps
set foundation = ps.foundation || coalesce((select to_jsonb(s) - 'id' - 'cafe_id' - 'created_at' - 'updated_at' - 'logo_url' - 'favicon_url' - 'hero_background_url' - 'gallery_images' - 'gallery_images_visible' - 'gallery_images_home' - 'featured_product_ids' from public.site_control s order by s.created_at asc nulls last limit 1), '{}'::jsonb)
where ps.foundation = '{}'::jsonb;
