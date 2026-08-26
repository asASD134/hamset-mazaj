import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePlatformFoundation } from "@/services/platformSettings";

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

  // Only the explicitly whitelisted platform foundation fields are copied.
  // Manually-entered text, names, descriptions, logos, gallery images,
  // menus and every other cafe-owned value remain untouched.
  const foundation = sanitizePlatformFoundation(templateSite);
  const update: Record<string, unknown> = {
    ...foundation,
    updated_at: new Date().toISOString(),
  };

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
