import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_SLUG = "__platform_template__";
const CAFE_SETTING_COPY_KEYS = [
  "cafe_name", "is_open", "logo_url", "phone", "whatsapp", "address", "maps_url",
  "instagram_handle", "snapchat_handle", "tiktok_handle", "email", "facebook_url", "opening_hours", "description",
] as const;
const SITE_CONTROL_COPY_KEYS = [
  "site_name", "tagline", "description", "logo_url", "favicon_url", "primary_color", "background_color", "surface_color", "typography",
  "hero_enabled", "hero_title", "hero_subtitle", "hero_description", "hero_background_url", "hero_badge",
  "hero_primary_enabled", "hero_primary_text", "hero_primary_url", "hero_secondary_enabled", "hero_secondary_text", "hero_secondary_url",
  "featured_enabled", "featured_title", "featured_description", "featured_limit",
  "why_enabled", "why_title", "why_description", "matches_enabled", "matches_title", "matches_description",
  "gallery_enabled", "gallery_title", "gallery_description", "gallery_images", "gallery_images_visible", "gallery_images_home",
  "testimonials_enabled", "testimonials_title", "testimonials_description", "contact_enabled", "contact_title", "contact_description",
  "footer_enabled", "footer_description", "show_phone", "show_address", "show_opening_hours", "show_social_links", "show_map", "section_order",
  "show_site_name", "show_tagline", "show_site_description", "show_logo", "show_hero_badge", "show_hero_title", "show_hero_subtitle", "show_hero_description", "show_hero_background", "show_hero_primary_button", "show_hero_secondary_button",
  "show_featured_badge", "show_featured_title", "show_featured_description", "show_featured_products", "show_featured_prices", "show_featured_button",
  "show_why_title", "show_why_description", "show_why_features", "show_matches_title", "show_matches_description", "show_matches_list", "show_matches_button",
  "show_gallery_title", "show_gallery_description", "show_gallery_images", "show_gallery_button", "show_testimonials_title", "show_testimonials_description", "show_testimonials_list",
  "show_contact_title", "show_contact_description", "show_contact_address", "show_contact_phone", "show_contact_hours", "show_contact_map", "show_contact_social_links",
  "show_footer_description", "show_footer_links", "show_footer_contact", "show_footer_social_links", "show_footer_copyright",
] as const;

export async function GET() {
  const supabase = await createClient();
  const { data: isSystemAdmin, error } = await supabase.rpc("is_system_admin");
  if (error || !isSystemAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error: listError } = await admin.from("cafes").select("id,name,slug,owner_user_id,is_active,created_at,updated_at").order("created_at", { ascending: false });
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
  return NextResponse.json({ cafes: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: isSystemAdmin, error: roleError } = await supabase.rpc("is_system_admin");
  if (roleError || !isSystemAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await request.json();
  const name = String(body?.name || "").trim();
  const slug = String(body?.slug || "").trim().toLowerCase();
  const ownerEmail = String(body?.ownerEmail || "").trim().toLowerCase();
  const ownerPassword = String(body?.ownerPassword || "");

  if (!name || !slug || !ownerEmail || !ownerPassword) return NextResponse.json({ error: "اسم المقهى والرابط وبيانات المالك مطلوبة." }, { status: 400 });
  if (!/^[a-z0-9-]{3,64}$/.test(slug)) return NextResponse.json({ error: "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط." }, { status: 400 });
  if (ownerPassword.length < 8) return NextResponse.json({ error: "كلمة المرور يجب ألا تقل عن 8 أحرف." }, { status: 400 });

  const admin = createAdminClient();
  const { data: existingSlug } = await admin.from("cafes").select("id").eq("slug", slug).maybeSingle();
  if (existingSlug) return NextResponse.json({ error: "هذا الرابط مستخدم بالفعل." }, { status: 409 });

  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({ email: ownerEmail, password: ownerPassword, email_confirm: true });
  if (userError || !createdUser.user) return NextResponse.json({ error: userError?.message || "تعذر إنشاء حساب المالك." }, { status: 400 });

  const { data: cafe, error: cafeError } = await admin.from("cafes").insert({ name, slug, owner_user_id: createdUser.user.id, is_active: true }).select("id,name,slug,owner_user_id,is_active,created_at,updated_at").single();
  if (cafeError || !cafe) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: cafeError?.message || "تعذر إنشاء المقهى." }, { status: 500 });
  }

  const { error: memberError } = await admin.from("cafe_members").insert({ cafe_id: cafe.id, user_id: createdUser.user.id, role: "owner" });
  if (memberError) {
    await admin.from("cafes").delete().eq("id", cafe.id);
    await admin.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const { data: templateCafe } = await admin.from("cafes").select("id").eq("slug", TEMPLATE_SLUG).maybeSingle();
  if (templateCafe) {
    const [{ data: templateCafeSettings }, { data: templateSiteControl }] = await Promise.all([
      admin.from("cafe_settings").select("*").eq("cafe_id", templateCafe.id).maybeSingle(),
      admin.from("site_control").select("*").eq("cafe_id", templateCafe.id).maybeSingle(),
    ]);

    const cafeSettingsInsert: Record<string, unknown> = { cafe_id: cafe.id, cafe_name: name, is_open: true };
    if (templateCafeSettings) {
      for (const key of CAFE_SETTING_COPY_KEYS) {
        if (key === "cafe_name") continue;
        if (templateCafeSettings[key] !== undefined) cafeSettingsInsert[key] = templateCafeSettings[key];
      }
    }
    await admin.from("cafe_settings").insert(cafeSettingsInsert);

    const siteControlInsert: Record<string, unknown> = { cafe_id: cafe.id, site_name: name };
    if (templateSiteControl) {
      for (const key of SITE_CONTROL_COPY_KEYS) {
        if (key === "site_name") continue;
        if (templateSiteControl[key] !== undefined) siteControlInsert[key] = templateSiteControl[key];
      }
    }
    await admin.from("site_control").insert(siteControlInsert);
  } else {
    await admin.from("cafe_settings").insert({ cafe_id: cafe.id, cafe_name: name, is_open: true });
    await admin.from("site_control").insert({ cafe_id: cafe.id, site_name: name });
  }

  return NextResponse.json({ cafe }, { status: 201 });
}
