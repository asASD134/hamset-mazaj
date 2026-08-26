import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePlatformFoundation } from "@/services/platformSettings";

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

export async function POST() {
  const admin = await requireSystemAdmin();
  if (!admin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { data: platformSettings, error: platformError } = await admin
    .from("platform_settings")
    .select("foundation, version")
    .eq("singleton", true)
    .single();

  if (platformError || !platformSettings) {
    return NextResponse.json(
      { error: platformError?.message || "إعدادات المنصة غير موجودة." },
      { status: 500 }
    );
  }

  // The publish source is the platform settings record itself.
  // Never read the template cafe's content here, so cafe-owned text,
  // logos, backgrounds, gallery images, menu data and other content
  // can never leak into other cafes through the global publish action.
  const foundation = sanitizePlatformFoundation(
    (platformSettings.foundation || {}) as Record<string, unknown>
  );

  const update: Record<string, unknown> = {
    ...foundation,
    updated_at: new Date().toISOString(),
  };

  const { data: cafes, error: cafesError } = await admin
    .from("cafes")
    .select("id")
    .neq("slug", "__platform_template__")
    .eq("is_active", true);

  if (cafesError) {
    return NextResponse.json(
      { error: cafesError.message },
      { status: 500 }
    );
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
    version: platformSettings.version,
  });
}
