import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_SLUG = "__platform_template__";
const CAFE_SETTINGS_KEYS = [
  "cafe_name",
  "is_open",
  "logo_url",
  "phone",
  "whatsapp",
  "address",
  "maps_url",
  "instagram_handle",
  "snapchat_handle",
  "tiktok_handle",
  "email",
  "facebook_url",
  "opening_hours",
  "description",
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
  const payload = body?.cafeSettings && typeof body.cafeSettings === "object" ? body.cafeSettings : body;

  const { data: templateCafe, error: templateError } = await admin
    .from("cafes")
    .select("id")
    .eq("slug", TEMPLATE_SLUG)
    .single();

  if (templateError || !templateCafe) {
    return NextResponse.json({ error: "قالب الإدارة العامة غير موجود." }, { status: 500 });
  }

  const { data: templateSettings, error: settingsError } = await admin
    .from("cafe_settings")
    .select("*")
    .eq("cafe_id", templateCafe.id)
    .single();

  if (settingsError || !templateSettings) {
    return NextResponse.json({ error: "بيانات قالب الإدارة العامة غير موجودة." }, { status: 500 });
  }

  const changed: Record<string, unknown> = {};
  for (const key of CAFE_SETTINGS_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
    const nextValue = payload[key];
    const currentValue = templateSettings[key];
    if (JSON.stringify(nextValue) !== JSON.stringify(currentValue)) changed[key] = nextValue;
  }

  if (Object.keys(changed).length === 0) {
    return NextResponse.json({ ok: true, changedKeys: [], updatedCount: 0 });
  }

  changed.updated_at = new Date().toISOString();

  const { error: templateUpdateError } = await admin
    .from("cafe_settings")
    .update(changed)
    .eq("cafe_id", templateCafe.id);

  if (templateUpdateError) return NextResponse.json({ error: templateUpdateError.message }, { status: 500 });

  const { data: cafes, error: cafesError } = await admin
    .from("cafes")
    .select("id")
    .neq("id", templateCafe.id)
    .eq("is_active", true);

  if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

  let updatedCount = 0;
  for (const cafe of cafes ?? []) {
    const { error } = await admin
      .from("cafe_settings")
      .update(changed)
      .eq("cafe_id", cafe.id);

    if (error) return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
    updatedCount += 1;
  }

  return NextResponse.json({ ok: true, changedKeys: Object.keys(changed).filter((key) => key !== "updated_at"), updatedCount });
}
