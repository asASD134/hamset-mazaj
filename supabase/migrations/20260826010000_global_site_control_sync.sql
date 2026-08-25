-- Global site foundations: synchronized for every cafe.
-- Cafe-specific content (name, phone, address, logo, images, products, etc.) stays local.
create or replace function public.sync_site_control_globals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    declare
      template_row public.site_control%rowtype;
    begin
      select * into template_row
      from public.site_control
      where id <> new.id
      order by created_at asc nulls last
      limit 1;

      if template_row.id is not null then
        new.primary_color := template_row.primary_color;
        new.background_color := template_row.background_color;
        new.surface_color := template_row.surface_color;
        new.typography := template_row.typography;
        new.featured_limit := template_row.featured_limit;
        new.hero_enabled := template_row.hero_enabled;
        new.hero_primary_enabled := template_row.hero_primary_enabled;
        new.hero_secondary_enabled := template_row.hero_secondary_enabled;
        new.featured_enabled := template_row.featured_enabled;
        new.why_enabled := template_row.why_enabled;
        new.matches_enabled := template_row.matches_enabled;
        new.gallery_enabled := template_row.gallery_enabled;
        new.testimonials_enabled := template_row.testimonials_enabled;
        new.contact_enabled := template_row.contact_enabled;
        new.footer_enabled := template_row.footer_enabled;
        new.show_phone := template_row.show_phone;
        new.show_address := template_row.show_address;
        new.show_opening_hours := template_row.show_opening_hours;
        new.show_social_links := template_row.show_social_links;
        new.show_map := template_row.show_map;
        new.section_order := template_row.section_order;
        new.show_site_name := template_row.show_site_name;
        new.show_tagline := template_row.show_tagline;
        new.show_site_description := template_row.show_site_description;
        new.show_logo := template_row.show_logo;
        new.show_hero_badge := template_row.show_hero_badge;
        new.show_hero_title := template_row.show_hero_title;
        new.show_hero_subtitle := template_row.show_hero_subtitle;
        new.show_hero_description := template_row.show_hero_description;
        new.show_hero_background := template_row.show_hero_background;
        new.show_hero_primary_button := template_row.show_hero_primary_button;
        new.show_hero_secondary_button := template_row.show_hero_secondary_button;
        new.show_featured_badge := template_row.show_featured_badge;
        new.show_featured_title := template_row.show_featured_title;
        new.show_featured_description := template_row.show_featured_description;
        new.show_featured_products := template_row.show_featured_products;
        new.show_featured_prices := template_row.show_featured_prices;
        new.show_featured_button := template_row.show_featured_button;
        new.show_why_title := template_row.show_why_title;
        new.show_why_description := template_row.show_why_description;
        new.show_why_features := template_row.show_why_features;
        new.show_matches_title := template_row.show_matches_title;
        new.show_matches_description := template_row.show_matches_description;
        new.show_matches_list := template_row.show_matches_list;
        new.show_matches_button := template_row.show_matches_button;
        new.show_gallery_title := template_row.show_gallery_title;
        new.show_gallery_description := template_row.show_gallery_description;
        new.show_gallery_images := template_row.show_gallery_images;
        new.show_gallery_button := template_row.show_gallery_button;
        new.show_testimonials_title := template_row.show_testimonials_title;
        new.show_testimonials_description := template_row.show_testimonials_description;
        new.show_testimonials_list := template_row.show_testimonials_list;
        new.show_contact_title := template_row.show_contact_title;
        new.show_contact_description := template_row.show_contact_description;
        new.show_contact_address := template_row.show_contact_address;
        new.show_contact_phone := template_row.show_contact_phone;
        new.show_contact_hours := template_row.show_contact_hours;
        new.show_contact_map := template_row.show_contact_map;
        new.show_contact_social_links := template_row.show_contact_social_links;
        new.show_footer_description := template_row.show_footer_description;
        new.show_footer_links := template_row.show_footer_links;
        new.show_footer_contact := template_row.show_footer_contact;
        new.show_footer_social_links := template_row.show_footer_social_links;
        new.show_footer_copyright := template_row.show_footer_copyright;
      end if;
    end;
    return new;
  end if;

  if pg_trigger_depth() = 1 then
    update public.site_control
    set
      primary_color = new.primary_color,
      background_color = new.background_color,
      surface_color = new.surface_color,
      typography = new.typography,
      featured_limit = new.featured_limit,
      hero_enabled = new.hero_enabled,
      hero_primary_enabled = new.hero_primary_enabled,
      hero_secondary_enabled = new.hero_secondary_enabled,
      featured_enabled = new.featured_enabled,
      why_enabled = new.why_enabled,
      matches_enabled = new.matches_enabled,
      gallery_enabled = new.gallery_enabled,
      testimonials_enabled = new.testimonials_enabled,
      contact_enabled = new.contact_enabled,
      footer_enabled = new.footer_enabled,
      show_phone = new.show_phone,
      show_address = new.show_address,
      show_opening_hours = new.show_opening_hours,
      show_social_links = new.show_social_links,
      show_map = new.show_map,
      section_order = new.section_order,
      show_site_name = new.show_site_name,
      show_tagline = new.show_tagline,
      show_site_description = new.show_site_description,
      show_logo = new.show_logo,
      show_hero_badge = new.show_hero_badge,
      show_hero_title = new.show_hero_title,
      show_hero_subtitle = new.show_hero_subtitle,
      show_hero_description = new.show_hero_description,
      show_hero_background = new.show_hero_background,
      show_hero_primary_button = new.show_hero_primary_button,
      show_hero_secondary_button = new.show_hero_secondary_button,
      show_featured_badge = new.show_featured_badge,
      show_featured_title = new.show_featured_title,
      show_featured_description = new.show_featured_description,
      show_featured_products = new.show_featured_products,
      show_featured_prices = new.show_featured_prices,
      show_featured_button = new.show_featured_button,
      show_why_title = new.show_why_title,
      show_why_description = new.show_why_description,
      show_why_features = new.show_why_features,
      show_matches_title = new.show_matches_title,
      show_matches_description = new.show_matches_description,
      show_matches_list = new.show_matches_list,
      show_matches_button = new.show_matches_button,
      show_gallery_title = new.show_gallery_title,
      show_gallery_description = new.show_gallery_description,
      show_gallery_images = new.show_gallery_images,
      show_gallery_button = new.show_gallery_button,
      show_testimonials_title = new.show_testimonials_title,
      show_testimonials_description = new.show_testimonials_description,
      show_testimonials_list = new.show_testimonials_list,
      show_contact_title = new.show_contact_title,
      show_contact_description = new.show_contact_description,
      show_contact_address = new.show_contact_address,
      show_contact_phone = new.show_contact_phone,
      show_contact_hours = new.show_contact_hours,
      show_contact_map = new.show_contact_map,
      show_contact_social_links = new.show_contact_social_links,
      show_footer_description = new.show_footer_description,
      show_footer_links = new.show_footer_links,
      show_footer_contact = new.show_footer_contact,
      show_footer_social_links = new.show_footer_social_links,
      show_footer_copyright = new.show_footer_copyright,
      updated_at = now()
    where cafe_id <> new.cafe_id;
  end if;

  return new;
end;
$$;

drop trigger if exists site_control_global_sync_before_insert on public.site_control;
drop trigger if exists site_control_global_sync_after_write on public.site_control;

create trigger site_control_global_sync_before_insert
before insert on public.site_control
for each row
execute function public.sync_site_control_globals();

create trigger site_control_global_sync_after_write
after update on public.site_control
for each row
execute function public.sync_site_control_globals();

-- One-time reconciliation: use Hamset Mazaj as the current platform baseline,
-- then apply it to all other cafes without touching cafe-specific content.
do $$
declare
  template public.site_control%rowtype;
begin
  select * into template
  from public.site_control s
  join public.cafes c on c.id = s.cafe_id
  where c.slug = 'hamset-mazaj'
  limit 1;

  if template.id is not null then
    update public.site_control
    set
      primary_color = template.primary_color,
      background_color = template.background_color,
      surface_color = template.surface_color,
      typography = template.typography,
      featured_limit = template.featured_limit,
      hero_enabled = template.hero_enabled,
      hero_primary_enabled = template.hero_primary_enabled,
      hero_secondary_enabled = template.hero_secondary_enabled,
      featured_enabled = template.featured_enabled,
      why_enabled = template.why_enabled,
      matches_enabled = template.matches_enabled,
      gallery_enabled = template.gallery_enabled,
      testimonials_enabled = template.testimonials_enabled,
      contact_enabled = template.contact_enabled,
      footer_enabled = template.footer_enabled,
      show_phone = template.show_phone,
      show_address = template.show_address,
      show_opening_hours = template.show_opening_hours,
      show_social_links = template.show_social_links,
      show_map = template.show_map,
      section_order = template.section_order,
      show_site_name = template.show_site_name,
      show_tagline = template.show_tagline,
      show_site_description = template.show_site_description,
      show_logo = template.show_logo,
      show_hero_badge = template.show_hero_badge,
      show_hero_title = template.show_hero_title,
      show_hero_subtitle = template.show_hero_subtitle,
      show_hero_description = template.show_hero_description,
      show_hero_background = template.show_hero_background,
      show_hero_primary_button = template.show_hero_primary_button,
      show_hero_secondary_button = template.show_hero_secondary_button,
      show_featured_badge = template.show_featured_badge,
      show_featured_title = template.show_featured_title,
      show_featured_description = template.show_featured_description,
      show_featured_products = template.show_featured_products,
      show_featured_prices = template.show_featured_prices,
      show_featured_button = template.show_featured_button,
      show_why_title = template.show_why_title,
      show_why_description = template.show_why_description,
      show_why_features = template.show_why_features,
      show_matches_title = template.show_matches_title,
      show_matches_description = template.show_matches_description,
      show_matches_list = template.show_matches_list,
      show_matches_button = template.show_matches_button,
      show_gallery_title = template.show_gallery_title,
      show_gallery_description = template.show_gallery_description,
      show_gallery_images = template.show_gallery_images,
      show_gallery_button = template.show_gallery_button,
      show_testimonials_title = template.show_testimonials_title,
      show_testimonials_description = template.show_testimonials_description,
      show_testimonials_list = template.show_testimonials_list,
      show_contact_title = template.show_contact_title,
      show_contact_description = template.show_contact_description,
      show_contact_address = template.show_contact_address,
      show_contact_phone = template.show_contact_phone,
      show_contact_hours = template.show_contact_hours,
      show_contact_map = template.show_contact_map,
      show_contact_social_links = template.show_contact_social_links,
      show_footer_description = template.show_footer_description,
      show_footer_links = template.show_footer_links,
      show_footer_contact = template.show_footer_contact,
      show_footer_social_links = template.show_footer_social_links,
      show_footer_copyright = template.show_footer_copyright
    where cafe_id <> template.cafe_id;
  end if;
end $$;
