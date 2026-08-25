import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCafeServer } from "@/lib/cafe-context-server";

const ALLOWED_ROLES = ["owner", "manager", "cashier", "kitchen", "waiter", "operator"] as const;

async function guard() {
  const supabase = await createClient();
  const cafe = await getActiveCafeServer();
  if (!cafe) return { supabase, cafe: null, allowed: false };
  const { data: systemAdmin } = await supabase.rpc("is_system_admin");
  const { data: manager } = await supabase.rpc("is_cafe_manager", { p_cafe_id: cafe.id });
  return { supabase, cafe, allowed: Boolean(systemAdmin || manager) };
}

export async function GET() {
  const { cafe, allowed } = await guard();
  if (!cafe || !allowed) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const admin = createAdminClient();
  const { data: members, error } = await admin.from("cafe_members").select("cafe_id,user_id,role,created_at").eq("cafe_id", cafe.id).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const map = new Map((users.data.users ?? []).map((u) => [u.id, u]));
  return NextResponse.json({ members: (members ?? []).map((m) => ({ ...m, email: map.get(m.user_id)?.email ?? null })) });
}

export async function POST(request: Request) {
  const { cafe, allowed } = await guard();
  if (!cafe || !allowed) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = String(body?.role || "waiter");
  if (!email || password.length < 8 || !ALLOWED_ROLES.includes(role as any)) return NextResponse.json({ error: "البريد وكلمة المرور والدور مطلوبة." }, { status: 400 });
  const admin = createAdminClient();
  const { data: created, error: userError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (userError || !created.user) return NextResponse.json({ error: userError?.message || "تعذر إنشاء الحساب." }, { status: 400 });
  const { error: memberError } = await admin.from("cafe_members").insert({ cafe_id: cafe.id, user_id: created.user.id, role });
  if (memberError) { await admin.auth.admin.deleteUser(created.user.id); return NextResponse.json({ error: memberError.message }, { status: 500 }); }
  return NextResponse.json({ member: { cafe_id: cafe.id, user_id: created.user.id, role, email } }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { cafe, allowed } = await guard();
  if (!cafe || !allowed) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const userId = String(new URL(request.url).searchParams.get("userId") || "");
  if (!userId) return NextResponse.json({ error: "userId مطلوب" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("cafe_members").delete().eq("cafe_id", cafe.id).eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
