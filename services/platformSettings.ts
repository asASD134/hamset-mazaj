import { createClient } from "@/lib/supabase/server";

export type PlatformSettings = {
  id: string;
  singleton: boolean;
  primary_color: string;
  background_color: string;
  surface_color: string;
  global_typography: Record<string, unknown>;
  foundation: Record<string, unknown>;
  preview_assets: Record<string, unknown>;
  version: string;
  updated_at: string;
};

export const PLATFORM_FOUNDATION_KEYS = [
  "primary_color",
  "background_color",
  "surface_color",
  "typography",
  "section_order",
  "hero_enabled",
  "featured_enabled",
  "featured_limit",
  "why_enabled",
  "matches_enabled",
  "gallery_enabled",
  "testimonials_enabled",
  "contact_enabled",
  "footer_enabled",
  "show_phone",
  "show_address",
  "show_opening_hours",
  "show_social_links",
  "show_map",
  "show_site_name",
  "show_tagline",
  "show_site_description",
  "show_logo",
  "show_hero_badge",
  "show_hero_title",
  "show_hero_subtitle",
  "show_hero_description",
  "show_hero_background",
  "show_hero_primary_button",
  "show_hero_secondary_button",
  "show_featured_badge",
  "show_featured_title",
  "show_featured_description",
  "show_featured_products",
  "show_featured_prices",
  "show_featured_button",
  "show_why_title",
  "show_why_description",
  "show_why_features",
  "show_matches_title",
  "show_matches_description",
  "show_matches_list",
  "show_matches_button",
  "show_gallery_title",
  "show_gallery_description",
  "show_gallery_images",
  "show_gallery_button",
  "show_testimonials_title",
  "show_testimonials_description",
  "show_testimonials_list",
  "show_contact_title",
  "show_contact_description",
  "show_contact_address",
  "show_contact_phone",
  "show_contact_hours",
  "show_contact_map",
  "show_contact_social_links",
  "show_footer_description",
  "show_footer_links",
  "show_footer_contact",
  "show_footer_social_links",
  "show_footer_copyright",
  "menu_title",
  "menu_subtitle",
  "menu_columns_desktop",
  "menu_card_style",
  "menu_card_radius",
  "menu_card_shadow",
  "menu_show_images",
  "menu_show_descriptions",
  "menu_show_prices",
  "menu_show_featured_badge",
  "menu_show_search",
  "menu_category_style",
  "menu_category_sticky",
  "menu_section_spacing",
  "menu_image_ratio",
  "menu_card_background",
  "menu_card_border",
  "menu_price_color",
  "menu_accent_color",
] as const;

export function sanitizePlatformFoundation(value: Record<string, unknown>) {
  const allowed = new Set<string>(PLATFORM_FOUNDATION_KEYS);
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => allowed.has(key))
  );
}

const DEFAULTS = {
  primary_color: "#EAB308",
  background_color: "#0A0A0A",
  surface_color: "#121212",
  global_typography: {},
  foundation: {},
  preview_assets: {},
  version: "1.0.0",
} as const;

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error || !data) {
    return {
      id: "",
      singleton: true,
      ...DEFAULTS,
      updated_at: new Date().toISOString(),
    };
  }

  const row = data as PlatformSettings;

  return {
    ...DEFAULTS,
    ...row,
    foundation: sanitizePlatformFoundation(row.foundation || {}),
  };
}
