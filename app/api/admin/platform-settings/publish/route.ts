import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_SLUG = "__platform_template__";

// IMPORTANT:
// Only values that define the shared platform/system behavior belong here.
// User-entered cafe content (names, titles, descriptions, contact data,
// images, logos, gallery contents, menu data, etc.) MUST stay cafe-specific.
const GLOBAL_SITE_KEYS = [
  "primary_color",
  "background_color",
  "surface_color",
  "typography",
  "section_order",

  // Shared section structure / feature availability
  "hero_enabled",
  "featured_enabled",
  "why_enabled",
  "matches_enabled",
  "gallery_enabled",
  "testimonials_enabled",
  "contact_enabled",
  "footer_enabled",

  // Shared visibility / behavior switches
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
] as const;

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

export async function POST() {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { data: templateCafe, error: templateError } = await admin
    .from("cafes")
    .select("id")
    .eq("slug", TEMPLATE_SLUG)
    .single();

  if (templateError || !templateCafe) {
    return NextResponse.json({ error: "قالب المنصة غير موجود." }, { status: 500 });
  }

  const { data: templateSite, error: siteError } = await admin
    .from("site_control")
    .select("*")
    .eq("cafe_id", templateCafe.id)
    .single();

  if (siteError || !templateSite) {
    return NextResponse.json({ error: "إعدادات قالب المنصة غير موجودة." }, { status: 500 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of GLOBAL_SITE_KEYS) {
    update[key] = templateSite[key];
  }

  const { data: cafes, error: cafesError } = await admin
    .from("cafes")
    .select("id")
    .neq("id", templateCafe.id)
    .eq("is_active", true);

  if (cafesError) {
    return NextResponse.json({ error: cafesError.message }, { status: 500 });
  }

  let updatedCount = 0;
  for (const cafe of cafes ?? []) {
    const { error } = await admin
      .from("site_control")
      .update(update)
      .eq("cafe_id", cafe.id);

    if (error) {
      return NextResponse.json(
        { error: error.message, updatedCount },
        { status: 500 }
      );
    }

    updatedCount += 1;
  }

  return NextResponse.json({
    ok: true,
    updatedCount,
    version: new Date().toISOString(),
  });
}
