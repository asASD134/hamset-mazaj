import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SOURCE_SLUG = "hamset-mazaj";
const TEMPLATE_SLUG = "__platform_template__";

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

export async function POST() {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { data: sourceCafe, error: sourceError } = await admin.from("cafes").select("id,name,slug").eq("slug", SOURCE_SLUG).single();
  if (sourceError || !sourceCafe) return NextResponse.json({ error: "لم يتم العثور على مقهى همسة مزاج الأساسي." }, { status: 404 });

  const { data: templateCafe, error: templateError } = await admin.from("cafes").select("id").eq("slug", TEMPLATE_SLUG).single();
  if (templateError || !templateCafe) return NextResponse.json({ error: "قالب الإدارة العامة غير موجود." }, { status: 500 });

  const [{ data: sourceSite, error: sourceSiteError }, { data: sourceSettings, error: sourceSettingsError }] = await Promise.all([
    admin.from("site_control").select("*").eq("cafe_id", sourceCafe.id).single(),
    admin.from("cafe_settings").select("*").eq("cafe_id", sourceCafe.id).single(),
  ]);

  if (sourceSiteError || !sourceSite) return NextResponse.json({ error: sourceSiteError?.message || "إعدادات موقع همسة مزاج غير موجودة." }, { status: 500 });
  if (sourceSettingsError || !sourceSettings) return NextResponse.json({ error: sourceSettingsError?.message || "بيانات همسة مزاج غير موجودة." }, { status: 500 });

  // Baseline sync intentionally normalizes the complete site structure from
  // Hamset Mazaj. Cafe-specific contact/identity data in cafe_settings is
  // preserved for existing cafes; the shared site_control structure is copied.
  const { id: _sourceId, cafe_id: _sourceCafeId, created_at: _createdAt, updated_at: _updatedAt, ...sitePayload } = sourceSite as Record<string, unknown>;
  sitePayload.cafe_id = templateCafe.id;
  sitePayload.updated_at = new Date().toISOString();

  const { error: templateSiteUpdateError } = await admin.from("site_control").update(sitePayload).eq("cafe_id", templateCafe.id);
  if (templateSiteUpdateError) return NextResponse.json({ error: templateSiteUpdateError.message }, { status: 500 });

  const { data: cafes, error: cafesError } = await admin.from("cafes").select("id,slug").eq("is_active", true);
  if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

  let updatedCount = 0;
  for (const cafe of cafes ?? []) {
    if (cafe.id === sourceCafe.id || cafe.id === templateCafe.id) continue;

    const targetSitePayload = { ...sitePayload, cafe_id: cafe.id, updated_at: new Date().toISOString() };
    const { error } = await admin.from("site_control").update(targetSitePayload).eq("cafe_id", cafe.id);
    if (error) return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
    updatedCount += 1;
  }

  // Normalize social links from the reference site while leaving each
  // cafe_settings row (phone/address/logo/etc.) untouched.
  const { data: sourceLinks, error: linksError } = await admin
    .from("social_links")
    .select("name,url,icon,is_active,sort_order")
    .eq("cafe_settings_id", sourceSettings.id)
    .order("sort_order")
    .order("created_at");
  if (linksError) return NextResponse.json({ error: linksError.message }, { status: 500 });

  const targetSettingsIds = [templateCafe.id, ...(cafes ?? []).filter((c) => c.id !== sourceCafe.id && c.id !== templateCafe.id).map((c) => c.id)];
  for (const cafeId of targetSettingsIds) {
    const { data: targetSettings, error: targetSettingsError } = await admin.from("cafe_settings").select("id").eq("cafe_id", cafeId).single();
    if (targetSettingsError || !targetSettings) return NextResponse.json({ error: targetSettingsError?.message || "إعدادات أحد المقاهي غير موجودة." }, { status: 500 });

    const { error: deleteError } = await admin.from("social_links").delete().eq("cafe_settings_id", targetSettings.id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    if ((sourceLinks ?? []).length > 0) {
      const rows = sourceLinks.map((link) => ({ cafe_settings_id: targetSettings.id, name: link.name, url: link.url, icon: link.icon, is_active: link.is_active, sort_order: link.sort_order }));
      const { error: insertError } = await admin.from("social_links").insert(rows);
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, source: sourceCafe.slug, updatedCount: updatedCount + 1 });
}
