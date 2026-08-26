import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_SLUG = "__platform_template__";

const SITE_CONTROL_KEYS = [
  "site_name",
  "tagline",
  "description",
  "logo_url",
  "favicon_url",
  "primary_color",
  "background_color",
  "surface_color",
  "typography",
  "hero_enabled",
  "hero_title",
  "hero_subtitle",
  "hero_description",
  "hero_background_url",
  "hero_badge",
  "hero_primary_enabled",
  "hero_primary_text",
  "hero_primary_url",
  "hero_secondary_enabled",
  "hero_secondary_text",
  "hero_secondary_url",
  "featured_enabled",
  "featured_limit",
  "why_enabled",
  "why_title",
  "why_description",
  "matches_enabled",
  "matches_title",
  "matches_description",
  "gallery_enabled",
  "gallery_title",
  "gallery_description",
  "gallery_images",
  "gallery_images_visible",
  "gallery_images_home",
  "testimonials_enabled",
  "testimonials_title",
  "testimonials_description",
  "contact_enabled",
  "contact_title",
  "contact_description",
  "footer_enabled",
  "footer_description",
  "show_phone",
  "show_address",
  "show_opening_hours",
  "show_social_links",
  "show_map",
  "section_order",
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
] as const;

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

export async function PATCH(request: Request) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const payload = body?.siteControl && typeof body.siteControl === "object" ? body.siteControl : body;

  const { data: templateCafe, error: templateError } = await admin
    .from("cafes")
    .select("id")
    .eq("slug", TEMPLATE_SLUG)
    .single();

  if (templateError || !templateCafe) {
    return NextResponse.json({ error: "قالب الإدارة العامة غير موجود." }, { status: 500 });
  }

  const { data: templateSite, error: siteError } = await admin
    .from("site_control")
    .select("*")
    .eq("cafe_id", templateCafe.id)
    .single();

  if (siteError || !templateSite) {
    return NextResponse.json({ error: "إعدادات قالب الإدارة العامة غير موجودة." }, { status: 500 });
  }

  const changed: Record<string, unknown> = {};

  for (const key of SITE_CONTROL_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
    const nextValue = payload[key];
    const currentValue = templateSite[key];
    if (JSON.stringify(nextValue) !== JSON.stringify(currentValue)) {
      changed[key] = nextValue;
    }
  }

  if (Object.keys(changed).length === 0) {
    return NextResponse.json({ ok: true, changedKeys: [], updatedCount: 0 });
  }

  changed.updated_at = new Date().toISOString();

  const { error: templateUpdateError } = await admin
    .from("site_control")
    .update(changed)
    .eq("cafe_id", templateCafe.id);

  if (templateUpdateError) {
    return NextResponse.json({ error: templateUpdateError.message }, { status: 500 });
  }

  const { data: cafes, error: cafesError } = await admin
    .from("cafes")
    .select("id")
    .neq("id", templateCafe.id)
    .eq("is_active", true);

  if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

  let updatedCount = 0;
  for (const cafe of cafes ?? []) {
    const { error } = await admin
      .from("site_control")
      .update(changed)
      .eq("cafe_id", cafe.id);

    if (error) {
      return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
    }
    updatedCount += 1;
  }

  return NextResponse.json({ ok: true, changedKeys: Object.keys(changed).filter((key) => key !== "updated_at"), updatedCount });
}
