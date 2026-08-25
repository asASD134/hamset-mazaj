-- Multi-tenant homepage defaults: ensure every cafe gets a complete baseline site_control row.
-- Safe/idempotent: only fills missing rows and never overwrites existing cafe-specific values.

insert into public.site_control (
  id,
  cafe_id,
  site_name,
  tagline,
  description,
  logo_url,
  favicon_url,
  primary_color,
  background_color,
  surface_color,
  hero_enabled,
  featured_enabled,
  why_enabled,
  matches_enabled,
  gallery_enabled,
  testimonials_enabled,
  contact_enabled,
  footer_enabled,
  section_order,
  typography,
  featured_product_ids,
  gallery_images_visible,
  gallery_images
)
select
  gen_random_uuid(),
  c.id,
  coalesce(nullif(cs.cafe_name, ''), c.name),
  coalesce((select sc0.tagline from public.site_control sc0 where sc0.cafe_id is null limit 1), null),
  coalesce((select sc0.description from public.site_control sc0 where sc0.cafe_id is null limit 1), null),
  cs.logo_url,
  coalesce((select sc0.favicon_url from public.site_control sc0 where sc0.cafe_id is null limit 1), null),
  coalesce((select sc0.primary_color from public.site_control sc0 where sc0.cafe_id is null limit 1), '#eab308'),
  coalesce((select sc0.background_color from public.site_control sc0 where sc0.cafe_id is null limit 1), '#050505'),
  coalesce((select sc0.surface_color from public.site_control sc0 where sc0.cafe_id is null limit 1), '#0b0b0b'),
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  coalesce((select sc0.section_order from public.site_control sc0 where sc0.cafe_id is null limit 1), '["hero","featured","why","matches","gallery","testimonials","contact"]'::jsonb),
  coalesce((select sc0.typography from public.site_control sc0 where sc0.cafe_id is null limit 1), '{}'::jsonb),
  '[]'::jsonb,
  '{true,true,true,true,true,true}',
  coalesce((select sc0.gallery_images from public.site_control sc0 where sc0.cafe_id is null limit 1), ARRAY['/images/gallery1.jpg','/images/gallery2.jpg','/images/gallery3.jpg','/images/gallery4.jpg','/images/gallery5.jpg','/images/gallery6.jpg'])
from public.cafes c
left join public.cafe_settings cs on cs.id = c.id
where not exists (
  select 1 from public.site_control sc where sc.cafe_id = c.id
);

-- Keep public reads available while enforcing cafe scoping for authenticated writes elsewhere.
create index if not exists site_control_cafe_id_idx on public.site_control(cafe_id);
