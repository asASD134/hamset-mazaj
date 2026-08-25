import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const cafeId = String(body?.cafeId || "");
  if (!cafeId) return NextResponse.json({ error: "cafeId مطلوب" }, { status: 400 });

  const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");
  const { data: cafeIds } = await supabase.rpc("current_cafe_ids");
  const allowed = Boolean(isSystemAdmin) || (cafeIds ?? []).includes(cafeId);
  if (!allowed) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("active_cafe_context", cafeId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
