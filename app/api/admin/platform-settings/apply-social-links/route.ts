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

export async function POST(request: Request) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "publish");

  const { data: templateCafe, error: templateError } = await admin
    .from("cafes")
    .select("id")
    .eq("slug", TEMPLATE_SLUG)
    .single();
  if (templateError || !templateCafe) return NextResponse.json({ error: "قالب الإدارة العامة غير موجود." }, { status: 500 });

  const { data: templateSettings, error: settingsError } = await admin
    .from("cafe_settings")
    .select("id")
    .eq("cafe_id", templateCafe.id)
    .single();
  if (settingsError || !templateSettings) return NextResponse.json({ error: "إعدادات قالب الإدارة العامة غير موجودة." }, { status: 500 });

  if (["create", "update", "delete"].includes(action) && action !== "delete") {
    const payload = body?.link && typeof body.link === "object" ? body.link : {};
    const name = String(payload?.name || "").trim();
    const url = String(payload?.url || "").trim();
    if (!name || !url) return NextResponse.json({ error: "اسم ورابط موقع التواصل مطلوبان." }, { status: 400 });

    if (action === "create") {
      const { error } = await admin.from("social_links").insert({
        cafe_settings_id: templateSettings.id,
        name,
        url,
        icon: String(payload?.icon || "🔗"),
        is_active: payload?.is_active !== false,
        sort_order: Number(payload?.sort_order || 0),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const id = String(body?.id || "");
      const update: Record<string, unknown> = { name, url };
      if (payload?.icon !== undefined) update.icon = String(payload.icon);
      if (payload?.is_active !== undefined) update.is_active = Boolean(payload.is_active);
      if (payload?.sort_order !== undefined) update.sort_order = Number(payload.sort_order);
      const { error } = await admin.from("social_links").update(update).eq("id", id).eq("cafe_settings_id", templateSettings.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === "delete") {
    const id = String(body?.id || "");
    const { error } = await admin.from("social_links").delete().eq("id", id).eq("cafe_settings_id", templateSettings.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: templateLinks, error: linksError } = await admin
    .from("social_links")
    .select("name,url,icon,is_active,sort_order")
    .eq("cafe_settings_id", templateSettings.id)
    .order("sort_order")
    .order("created_at");
  if (linksError) return NextResponse.json({ error: linksError.message }, { status: 500 });

  const { data: cafes, error: cafesError } = await admin
    .from("cafes")
    .select("id")
    .neq("id", templateCafe.id)
    .eq("is_active", true);
  if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

  let updatedCount = 0;
  for (const cafe of cafes ?? []) {
    const { data: targetSettings, error: targetSettingsError } = await admin
      .from("cafe_settings")
      .select("id")
      .eq("cafe_id", cafe.id)
      .single();
    if (targetSettingsError || !targetSettings) return NextResponse.json({ error: targetSettingsError?.message || "إعدادات أحد المقاهي غير موجودة.", updatedCount }, { status: 500 });

    const { error: deleteError } = await admin.from("social_links").delete().eq("cafe_settings_id", targetSettings.id);
    if (deleteError) return NextResponse.json({ error: deleteError.message, updatedCount }, { status: 500 });

    if ((templateLinks ?? []).length > 0) {
      const rows = templateLinks.map((link) => ({
        cafe_settings_id: targetSettings.id,
        name: link.name,
        url: link.url,
        icon: link.icon,
        is_active: link.is_active,
        sort_order: link.sort_order,
      }));
      const { error: insertError } = await admin.from("social_links").insert(rows);
      if (insertError) return NextResponse.json({ error: insertError.message, updatedCount }, { status: 500 });
    }

    updatedCount += 1;
  }

  return NextResponse.json({ ok: true, updatedCount });
}
