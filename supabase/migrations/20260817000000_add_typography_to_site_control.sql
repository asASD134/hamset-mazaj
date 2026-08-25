alter table public.site_control
add column if not exists typography jsonb
not null
default '{
  "navbar_site_name": {"desktop": 16, "mobile": 14},
  "navbar_links": {"desktop": 14, "mobile": 13},
  "hero_title": {"desktop": 64, "mobile": 42},
  "hero_subtitle": {"desktop": 30, "mobile": 22},
  "hero_description": {"desktop": 20, "mobile": 16},
  "featured_title": {"desktop": 40, "mobile": 30},
  "featured_description": {"desktop": 18, "mobile": 16},
  "featured_product_name": {"desktop": 24, "mobile": 20},
  "featured_price": {"desktop": 22, "mobile": 19},
  "why_title": {"desktop": 40, "mobile": 30},
  "why_description": {"desktop": 18, "mobile": 16},
  "gallery_title": {"desktop": 40, "mobile": 30},
  "gallery_description": {"desktop": 18, "mobile": 16},
  "testimonials_title": {"desktop": 40, "mobile": 30},
  "testimonials_description": {"desktop": 18, "mobile": 16},
  "contact_title": {"desktop": 40, "mobile": 30},
  "contact_description": {"desktop": 18, "mobile": 16},
  "contact_text": {"desktop": 18, "mobile": 16},
  "footer_text": {"desktop": 16, "mobile": 14}
}'::jsonb;

notify pgrst, 'reload schema';