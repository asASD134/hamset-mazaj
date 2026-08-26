import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { data: templateCafe, error: templateCafeError } = await admin
    .from("cafes")
    .select("id,name,slug")
    .eq("slug", TEMPLATE_SLUG)
    .single();

  if (templateCafeError || !templateCafe) {
    return NextResponse.json(
      { error: templateCafeError?.message || "قالب المنصة غير موجود." },
      { status: 500 }
    );
  }

  const { data: templateCafeSettings, error: cafeSettingsError } = await admin
    .from("cafe_settings")
    .select("*")
    .eq("cafe_id", templateCafe.id)
    .single();

  if (cafeSettingsError || !templateCafeSettings) {
    return NextResponse.json(
      { error: cafeSettingsError?.message || "إعدادات قالب المنصة غير موجودة." },
      { status: 500 }
    );
  }

  const { data: templateSiteControl, error: siteControlError } = await admin
    .from("site_control")
    .select("*")
    .eq("cafe_id", templateCafe.id)
    .single();

  if (siteControlError || !templateSiteControl) {
    return NextResponse.json(
      { error: siteControlError?.message || "إعدادات الصفحة الرئيسية للقالب غير موجودة." },
      { status: 500 }
    );
  }

  const { data: templateSocialLinks, error: templateSocialError } = await admin
    .from("social_links")
    .select("name,url,icon,is_active,sort_order")
    .eq("cafe_settings_id", templateCafeSettings.id)
    .order("sort_order")
    .order("created_at");

  if (templateSocialError) {
    return NextResponse.json({ error: templateSocialError.message }, { status: 500 });
  }

  const { data: targetCafes, error: cafesError } = await admin
    .from("cafes")
    .select("id")
    .neq("id", templateCafe.id)
    .eq("is_active", true);

  if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

  const publishedAt = new Date().toISOString();
  let updatedCount = 0;

  for (const cafe of targetCafes ?? []) {
    const { data: targetCafeSettings, error: targetSettingsError } = await admin
      .from("cafe_settings")
      .select("id")
      .eq("cafe_id", cafe.id)
      .single();

    if (targetSettingsError || !targetCafeSettings) {
      return NextResponse.json(
        { error: targetSettingsError?.message || `إعدادات المقهى ${cafe.id} غير موجودة.`, updatedCount },
        { status: 500 }
      );
    }

    const cafeSettingsUpdate = { ...templateCafeSettings } as Record<string, unknown>;
    delete cafeSettingsUpdate.id;
    delete cafeSettingsUpdate.cafe_id;
    delete cafeSettingsUpdate.created_at;
    cafeSettingsUpdate.updated_at = publishedAt;

    const { error: saveCafeSettingsError } = await admin
      .from("cafe_settings")
      .update(cafeSettingsUpdate)
      .eq("id", targetCafeSettings.id);

    if (saveCafeSettingsError) {
      return NextResponse.json({ error: saveCafeSettingsError.message, updatedCount }, { status: 500 });
    }

    const siteControlUpdate = { ...templateSiteControl } as Record<string, unknown>;
    delete siteControlUpdate.id;
    delete siteControlUpdate.cafe_id;
    delete siteControlUpdate.created_at;
    siteControlUpdate.updated_at = publishedAt;

    const { error: saveSiteControlError } = await admin
      .from("site_control")
      .update(siteControlUpdate)
      .eq("cafe_id", cafe.id);

    if (saveSiteControlError) {
      return NextResponse.json({ error: saveSiteControlError.message, updatedCount }, { status: 500 });
    }

    const { error: deleteSocialError } = await admin
      .from("social_links")
      .delete()
      .eq("cafe_settings_id", targetCafeSettings.id);

    if (deleteSocialError) {
      return NextResponse.json({ error: deleteSocialError.message, updatedCount }, { status: 500 });
    }

    if ((templateSocialLinks ?? []).length > 0) {
      const socialRows = templateSocialLinks.map((link) => ({
        cafe_settings_id: targetCafeSettings.id,
        name: link.name,
        url: link.url,
        icon: link.icon,
        is_active: link.is_active,
        sort_order: link.sort_order,
      }));

      const { error: insertSocialError } = await admin.from("social_links").insert(socialRows);
      if (insertSocialError) {
        return NextResponse.json({ error: insertSocialError.message, updatedCount }, { status: 500 });
      }
    }

    updatedCount += 1;
  }

  return NextResponse.json({
    ok: true,
    updatedCount,
    publishedAt,
    mode: "full-template-sync",
  });
}
