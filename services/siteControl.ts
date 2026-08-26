import { supabase } from "@/lib/supabase-browser";
import {
  getClientCafeId,
  isPlatformSettingsClientMode,
} from "@/lib/cafe-context-client";

const TABLE = "site_control";

export type TypographySize = {
  desktop: number;
  mobile: number;
};

export type SiteTypography = {
  navbar_site_name: TypographySize;
  navbar_links: TypographySize;
  hero_title: TypographySize;
  hero_subtitle: TypographySize;
  hero_description: TypographySize;
  featured_title: TypographySize;
  featured_description: TypographySize;
  featured_product_name: TypographySize;
  featured_price: TypographySize;
  why_title: TypographySize;
  why_description: TypographySize;
  matches_title: TypographySize;
  matches_description: TypographySize;
  matches_date: TypographySize;
  matches_time: TypographySize;
  matches_competition: TypographySize;
  matches_team_name: TypographySize;
  matches_countdown: TypographySize;
  gallery_title: TypographySize;
  gallery_description: TypographySize;
  testimonials_title: TypographySize;
  testimonials_description: TypographySize;
  contact_title: TypographySize;
  contact_description: TypographySize;
  contact_text: TypographySize;
  footer_text: TypographySize;
};

export type SiteControl = {
  id: string;
  cafe_id?: string;
  site_name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  background_color: string;
  surface_color: string;
  typography: SiteTypography;
  hero_enabled: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_background_url: string | null;
  hero_badge: string | null;
  hero_primary_enabled: boolean;
  hero_primary_text: string | null;
  hero_primary_url: string | null;
  hero_secondary_enabled: boolean;
  hero_secondary_text: string | null;
  hero_secondary_url: string | null;
  featured_enabled: boolean;
  featured_title: string | null;
  featured_description: string | null;
  featured_limit: number;
  featured_product_ids: string[];
  why_enabled: boolean;
  why_title: string | null;
  why_description: string | null;
  matches_enabled: boolean;
  matches_title: string | null;
  matches_description: string | null;
  gallery_enabled: boolean;
  gallery_title: string | null;
  gallery_description: string | null;
  gallery_images: string[];
  gallery_images_visible: boolean[];
  gallery_images_home: boolean[];
  testimonials_enabled: boolean;
  testimonials_title: string | null;
  testimonials_description: string | null;
  contact_enabled: boolean;
  contact_title: string | null;
  contact_description: string | null;
  footer_enabled: boolean;
  footer_description: string | null;
  show_phone: boolean;
  show_address: boolean;
  show_opening_hours: boolean;
  show_social_links: boolean;
  show_map: boolean;
  section_order: string[];
  show_site_name: boolean;
  show_tagline: boolean;
  show_site_description: boolean;
  show_logo: boolean;
  show_hero_badge: boolean;
  show_hero_title: boolean;
  show_hero_subtitle: boolean;
  show_hero_description: boolean;
  show_hero_background: boolean;
  show_hero_primary_button: boolean;
  show_hero_secondary_button: boolean;
  show_featured_badge: boolean;
  show_featured_title: boolean;
  show_featured_description: boolean;
  show_featured_products: boolean;
  show_featured_prices: boolean;
  show_featured_button: boolean;
  show_why_title: boolean;
  show_why_description: boolean;
  show_why_features: boolean;
  show_matches_title: boolean;
  show_matches_description: boolean;
  show_matches_list: boolean;
  show_matches_button: boolean;
  show_gallery_title: boolean;
  show_gallery_description: boolean;
  show_gallery_images: boolean;
  show_gallery_button: boolean;
  show_testimonials_title: boolean;
  show_testimonials_description: boolean;
  show_testimonials_list: boolean;
  show_contact_title: boolean;
  show_contact_description: boolean;
  show_contact_address: boolean;
  show_contact_phone: boolean;
  show_contact_hours: boolean;
  show_contact_map: boolean;
  show_contact_social_links: boolean;
  show_footer_description: boolean;
  show_footer_links: boolean;
  show_footer_contact: boolean;
  show_footer_social_links: boolean;
  show_footer_copyright: boolean;
  created_at: string;
  updated_at: string;
};

export async function getSiteControl(): Promise<SiteControl | null> {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE).select("*").eq("cafe_id", cafeId).maybeSingle();
  if (error) throw error;
  return (data as SiteControl | null) ?? null;
}

const UPDATE_KEYS: Array<keyof SiteControl> = [
  "site_name", "tagline", "description", "logo_url", "favicon_url",
  "primary_color", "background_color", "surface_color", "typography",
  "hero_enabled", "hero_title", "hero_subtitle", "hero_description", "hero_background_url", "hero_badge",
  "hero_primary_enabled", "hero_primary_text", "hero_primary_url",
  "hero_secondary_enabled", "hero_secondary_text", "hero_secondary_url",
  "featured_enabled", "featured_title", "featured_description", "featured_limit", "featured_product_ids",
  "why_enabled", "why_title", "why_description",
  "matches_enabled", "matches_title", "matches_description",
  "gallery_enabled", "gallery_title", "gallery_description", "gallery_images", "gallery_images_visible", "gallery_images_home",
  "testimonials_enabled", "testimonials_title", "testimonials_description",
  "contact_enabled", "contact_title", "contact_description",
  "footer_enabled", "footer_description",
  "show_phone", "show_address", "show_opening_hours", "show_social_links", "show_map", "section_order",
  "show_site_name", "show_tagline", "show_site_description", "show_logo",
  "show_hero_badge", "show_hero_title", "show_hero_subtitle", "show_hero_description", "show_hero_background", "show_hero_primary_button", "show_hero_secondary_button",
  "show_featured_badge", "show_featured_title", "show_featured_description", "show_featured_products", "show_featured_prices", "show_featured_button",
  "show_why_title", "show_why_description", "show_why_features",
  "show_matches_title", "show_matches_description", "show_matches_list", "show_matches_button",
  "show_gallery_title", "show_gallery_description", "show_gallery_images", "show_gallery_button",
  "show_testimonials_title", "show_testimonials_description", "show_testimonials_list",
  "show_contact_title", "show_contact_description", "show_contact_address", "show_contact_phone", "show_contact_hours", "show_contact_map", "show_contact_social_links",
  "show_footer_description", "show_footer_links", "show_footer_contact", "show_footer_social_links", "show_footer_copyright",
];

function buildUpdatePayload(payload: Partial<SiteControl>) {
  const updatePayload: Record<string, unknown> = {};
  for (const key of UPDATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) updatePayload[key] = payload[key];
  }
  return updatePayload;
}

export async function updateSiteControl(payload: Partial<SiteControl>): Promise<SiteControl> {
  if (isPlatformSettingsClientMode()) {
    const updatePayload = buildUpdatePayload(payload);
    const response = await fetch("/api/admin/platform-settings/apply-site-control", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteControl: updatePayload }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.error || "تعذر نشر تحديث الموقع.");
    const refreshed = await getSiteControl();
    if (!refreshed) throw new Error("site_control row not found");
    return refreshed;
  }

  const existing = await getSiteControl();
  const cafeId = await getClientCafeId();
  if (!existing) throw new Error("site_control row not found");

  const updatePayload = buildUpdatePayload(payload);

  if (Object.prototype.hasOwnProperty.call(payload, "gallery_images_visible")) {
    const incoming = Array.isArray(payload.gallery_images_visible) ? payload.gallery_images_visible : [];
    const current = Array.isArray(existing.gallery_images_visible) ? existing.gallery_images_visible : [];
    const imageCount = Array.isArray(payload.gallery_images) ? payload.gallery_images.length : Array.isArray(existing.gallery_images) ? existing.gallery_images.length : 0;
    updatePayload.gallery_images_visible = Array.from({ length: imageCount }, (_, index) =>
      typeof incoming[index] === "boolean" ? incoming[index] : typeof current[index] === "boolean" ? current[index] : true
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "gallery_images_home")) {
    const incoming = Array.isArray(payload.gallery_images_home) ? payload.gallery_images_home : [];
    const current = Array.isArray(existing.gallery_images_home) ? existing.gallery_images_home : [];
    const imageCount = Array.isArray(payload.gallery_images) ? payload.gallery_images.length : Array.isArray(existing.gallery_images) ? existing.gallery_images.length : 0;
    updatePayload.gallery_images_home = Array.from({ length: imageCount }, (_, index) =>
      typeof incoming[index] === "boolean" ? incoming[index] : typeof current[index] === "boolean" ? current[index] : false
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "gallery_images")) {
    const images = Array.isArray(payload.gallery_images) ? payload.gallery_images : [];
    if (!Object.prototype.hasOwnProperty.call(payload, "gallery_images_visible")) {
      const currentVisibility = Array.isArray(existing.gallery_images_visible) ? existing.gallery_images_visible : [];
      updatePayload.gallery_images_visible = images.map((_, index) => typeof currentVisibility[index] === "boolean" ? currentVisibility[index] : true);
    }
    if (!Object.prototype.hasOwnProperty.call(payload, "gallery_images_home")) {
      const currentHome = Array.isArray(existing.gallery_images_home) ? existing.gallery_images_home : [];
      updatePayload.gallery_images_home = images.map((_, index) => typeof currentHome[index] === "boolean" ? currentHome[index] : false);
    }
  }

  if (Object.keys(updatePayload).length === 0) return existing;

  const { data, error } = await supabase.from(TABLE).update(updatePayload).eq("id", existing.id).eq("cafe_id", cafeId).select("*").single();
  if (error) throw error;
  return data as SiteControl;
}
