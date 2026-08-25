import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PLATFORM_TEMPLATE_SLUG = "__platform_template__";

export async function GET() {
  const supabase = await createClient();
  const { data: isSystemAdmin, error } = await supabase.rpc("is_system_admin");
  if (error || !isSystemAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error: listError } = await admin
    .from("cafes")
    .select("id,name,slug,owner_user_id,is_active,created_at,updated_at")
    .neq("slug", PLATFORM_TEMPLATE_SLUG)
    .order("created_at", { ascending: false });

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

  const { data: cafe, error: cafeError } = await admin
    .from("cafes")
    .insert({ name, slug, owner_user_id: createdUser.user.id, is_active: true })
    .select("id,name,slug,owner_user_id,is_active,created_at,updated_at")
    .single();

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

  await admin.from("cafe_settings").insert({ cafe_id: cafe.id, cafe_name: name, is_open: true });
  await admin.from("site_control").insert({ cafe_id: cafe.id, site_name: name });

  return NextResponse.json({ cafe }, { status: 201 });
}
