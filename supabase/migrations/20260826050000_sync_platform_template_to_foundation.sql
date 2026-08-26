-- The platform settings page intentionally reuses the normal cafe settings UI.
-- It writes into the hidden platform template cafe so the UI can still preview
-- all of the normal fields. This trigger extracts ONLY platform-wide behavior
-- from that template into platform_settings. Cafe-owned content never enters
-- the published foundation.

create or replace function public.sync_platform_template_foundation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_template boolean := false;
  v_foundation jsonb;
  v_current_version text;
  v_match text[];
  v_next_version text;
begin
  select exists (
    select 1
    from public.cafes c
    where c.id = new.cafe_id
      and c.slug = '__platform_template__'
  )
  into v_is_template;

  if not v_is_template then
    return new;
  end if;

  -- Start from the explicit platform-only fields.
  v_foundation := jsonb_build_object(
    'primary_color', new.primary_color,
    'background_color', new.background_color,
    'surface_color', new.surface_color,
    'typography', coalesce(new.typography, '{}'::jsonb),
    'section_order', coalesce(to_jsonb(new.section_order), '[]'::jsonb),

    'hero_enabled', new.hero_enabled,
    'featured_enabled', new.featured_enabled,
    'featured_limit', new.featured_limit,
    'why_enabled', new.why_enabled,
    'matches_enabled', new.matches_enabled,
    'gallery_enabled', new.gallery_enabled,
    'testimonials_enabled', new.testimonials_enabled,
    'contact_enabled', new.contact_enabled,
    'footer_enabled', new.footer_enabled,

    'show_phone', new.show_phone,
    'show_address', new.show_address,
    'show_opening_hours', new.show_opening_hours,
    'show_social_links', new.show_social_links,
    'show_map', new.show_map,
    'show_site_name', new.show_site_name,
    'show_tagline', new.show_tagline,
    'show_site_description', new.show_site_description,
    'show_logo', new.show_logo,

    'show_hero_badge', new.show_hero_badge,
    'show_hero_title', new.show_hero_title,
    'show_hero_subtitle', new.show_hero_subtitle,
    'show_hero_description', new.show_hero_description,
    'show_hero_background', new.show_hero_background,
    'show_hero_primary_button', new.show_hero_primary_button,
    'show_hero_secondary_button', new.show_hero_secondary_button,

    'show_featured_badge', new.show_featured_badge,
    'show_featured_title', new.show_featured_title,
    'show_featured_description', new.show_featured_description,
    'show_featured_products', new.show_featured_products,
    'show_featured_prices', new.show_featured_prices,
    'show_featured_button', new.show_featured_button,

    'show_why_title', new.show_why_title,
    'show_why_description', new.show_why_description,
    'show_why_features', new.show_why_features,

    'show_matches_title', new.show_matches_title,
    'show_matches_description', new.show_matches_description,
    'show_matches_list', new.show_matches_list,
    'show_matches_button', new.show_matches_button,

    'show_gallery_title', new.show_gallery_title,
    'show_gallery_description', new.show_gallery_description,
    'show_gallery_images', new.show_gallery_images,
    'show_gallery_button', new.show_gallery_button,

    'show_testimonials_title', new.show_testimonials_title,
    'show_testimonials_description', new.show_testimonials_description,
    'show_testimonials_list', new.show_testimonials_list,

    'show_contact_title', new.show_contact_title,
    'show_contact_description', new.show_contact_description,
    'show_contact_address', new.show_contact_address,
    'show_contact_phone', new.show_contact_phone,
    'show_contact_hours', new.show_contact_hours,
    'show_contact_map', new.show_contact_map,
    'show_contact_social_links', new.show_contact_social_links,

    'show_footer_description', new.show_footer_description,
    'show_footer_links', new.show_footer_links,
    'show_footer_contact', new.show_footer_contact,
    'show_footer_social_links', new.show_footer_social_links,
    'show_footer_copyright', new.show_footer_copyright
  );

  select version
  into v_current_version
  from public.platform_settings
  where singleton = true
  limit 1;

  v_current_version := coalesce(v_current_version, '1.0.0');
  v_match := regexp_matches(v_current_version, '^(\d+)\.(\d+)\.(\d+)$');

  if v_match is not null then
    v_next_version := format('%s.%s.%s', v_match[1], v_match[2], (v_match[3]::integer + 1));
  else
    v_next_version := '1.0.1';
  end if;

  update public.platform_settings
  set primary_color = new.primary_color,
      background_color = new.background_color,
      surface_color = new.surface_color,
      global_typography = coalesce(new.typography, '{}'::jsonb),
      foundation = v_foundation,
      version = v_next_version,
      updated_at = now()
  where singleton = true;

  return new;
end;
$$;

drop trigger if exists site_control_platform_template_sync on public.site_control;

create trigger site_control_platform_template_sync
after insert or update on public.site_control
for each row
execute function public.sync_platform_template_foundation();
