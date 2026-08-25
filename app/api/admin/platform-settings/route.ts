import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

export async function GET() {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { data, error } = await admin
    .from("platform_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

function validHex(value: unknown) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const GLOBAL_FOUNDATION_KEYS = new Set([
  "hero_enabled",
  "featured_enabled", "featured_limit",
  "why_enabled",
  "matches_enabled",
  "gallery_enabled",
  "testimonials_enabled",
  "contact_enabled",
  "footer_enabled",
  "show_phone", "show_address", "show_opening_hours", "show_social_links", "show_map",
  "section_order",
  "show_site_name", "show_tagline", "show_site_description", "show_logo",
  "show_hero_badge", "show_hero_title", "show_hero_subtitle", "show_hero_description", "show_hero_primary_button", "show_hero_secondary_button",
  "show_featured_badge", "show_featured_title", "show_featured_description", "show_featured_products", "show_featured_prices", "show_featured_button",
  "show_why_title", "show_why_description", "show_why_features",
  "show_matches_title", "show_matches_description", "show_matches_list", "show_matches_button",
  "show_gallery_title", "show_gallery_description", "show_gallery_images", "show_gallery_button",
  "show_testimonials_title", "show_testimonials_description", "show_testimonials_list",
  "show_contact_title", "show_contact_description", "show_contact_address", "show_contact_phone", "show_contact_hours", "show_contact_map", "show_contact_social_links",
  "show_footer_description", "show_footer_links", "show_footer_contact", "show_footer_social_links", "show_footer_copyright",
  "primary_color", "background_color", "surface_color", "typography",
]);

function sanitizeFoundation(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => GLOBAL_FOUNDATION_KEYS.has(key))
  );
}

export async function PATCH(request: Request) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (Object.hasOwn(body, "primary_color")) {
    if (!validHex(body.primary_color)) return NextResponse.json({ error: "اللون الأساسي غير صحيح." }, { status: 400 });
    updates.primary_color = body.primary_color.trim().toUpperCase();
  }
  if (Object.hasOwn(body, "background_color")) {
    if (!validHex(body.background_color)) return NextResponse.json({ error: "لون الخلفية غير صحيح." }, { status: 400 });
    updates.background_color = body.background_color.trim().toUpperCase();
  }
  if (Object.hasOwn(body, "surface_color")) {
    if (!validHex(body.surface_color)) return NextResponse.json({ error: "لون السطح غير صحيح." }, { status: 400 });
    updates.surface_color = body.surface_color.trim().toUpperCase();
  }
  if (Object.hasOwn(body, "global_typography")) {
    if (!isRecord(body.global_typography)) return NextResponse.json({ error: "إعدادات الخط العامة غير صحيحة." }, { status: 400 });
    updates.global_typography = body.global_typography;
  }
  if (Object.hasOwn(body, "foundation")) {
    if (!isRecord(body.foundation)) return NextResponse.json({ error: "إعدادات أساسيات المنصة غير صحيحة." }, { status: 400 });
    updates.foundation = sanitizeFoundation(body.foundation);
  }
  if (Object.hasOwn(body, "preview_assets")) {
    if (!isRecord(body.preview_assets)) return NextResponse.json({ error: "بيانات معاينة المنصة غير صحيحة." }, { status: 400 });
    updates.preview_assets = body.preview_assets;
  }

  const current = await admin
    .from("platform_settings")
    .select("version")
    .eq("singleton", true)
    .maybeSingle();

  const currentVersion = String(current.data?.version || "1.0.0");
  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);
  const nextVersion = match
    ? `${match[1]}.${match[2]}.${Number(match[3]) + 1}`
    : "1.0.1";

  updates.version = nextVersion;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await admin
    .from("platform_settings")
    .update(updates)
    .eq("singleton", true)
    .select("*")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message || "تعذر حفظ الإعدادات العامة." }, { status: 500 });
  return NextResponse.json({ settings: data });
}
