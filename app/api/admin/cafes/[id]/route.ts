import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");

  if (error || !data) {
    return null;
  }

  return supabase;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const supabase = await requireSystemAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "معرف المقهى مطلوب" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const admin = createAdminClient();

  const { data: cafe, error: cafeError } = await admin
    .from("cafes")
    .select("id,name,slug,owner_user_id,is_active")
    .eq("id", id)
    .maybeSingle();

  if (cafeError || !cafe) {
    return NextResponse.json({ error: "المقهى غير موجود" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body?.is_active === "boolean") {
    updates.is_active = body.is_active;
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "اسم المقهى مطلوب" }, { status: 400 });
    }
    updates.name = name;
  }

  const requestedEmail =
    typeof body?.ownerEmail === "string"
      ? body.ownerEmail.trim().toLowerCase()
      : "";
  const requestedPassword =
    typeof body?.ownerPassword === "string"
      ? body.ownerPassword
      : "";

  if (requestedEmail && !/^\S+@\S+\.\S+$/.test(requestedEmail)) {
    return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
  }

  if (requestedPassword && requestedPassword.length < 6) {
    return NextResponse.json({ error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف" }, { status: 400 });
  }

  if ((requestedEmail || requestedPassword) && !cafe.owner_user_id) {
    return NextResponse.json({ error: "هذا المقهى لا يملك حسابًا مرتبطًا" }, { status: 400 });
  }

  if (requestedEmail || requestedPassword) {
    const authUpdates: Record<string, unknown> = {};
    if (requestedEmail) {
      authUpdates.email = requestedEmail;
      authUpdates.email_confirm = true;
    }
    if (requestedPassword) {
      authUpdates.password = requestedPassword;
    }

    const { error: authError } = await admin.auth.admin.updateUserById(
      cafe.owner_user_id as string,
      authUpdates
    );

    if (authError) {
      return NextResponse.json(
        { error: authError.message || "تعذر تحديث بيانات الدخول" },
        { status: 400 }
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ cafe });
  }

  const { data: updatedCafe, error: updateError } = await admin
    .from("cafes")
    .update(updates)
    .eq("id", id)
    .select("id,name,slug,owner_user_id,is_active,created_at,updated_at")
    .single();

  if (updateError || !updatedCafe) {
    return NextResponse.json(
      { error: updateError?.message || "تعذر تحديث المقهى" },
      { status: 500 }
    );
  }

  return NextResponse.json({ cafe: updatedCafe });
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const supabase = await requireSystemAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const confirmName = String(body?.confirmName || "").trim();

  const admin = createAdminClient();
  const { data: cafe, error: cafeError } = await admin
    .from("cafes")
    .select("id,name,is_active")
    .eq("id", id)
    .maybeSingle();

  if (cafeError || !cafe) {
    return NextResponse.json({ error: "المقهى غير موجود" }, { status: 404 });
  }

  if (confirmName !== cafe.name) {
    return NextResponse.json(
      { error: "اكتب اسم المقهى بالكامل للتأكيد على الأرشفة" },
      { status: 400 }
    );
  }

  const { data: archived, error: archiveError } = await admin
    .from("cafes")
    .update({ is_active: false })
    .eq("id", id)
    .select("id,name,slug,owner_user_id,is_active,created_at,updated_at")
    .single();

  if (archiveError || !archived) {
    return NextResponse.json(
      { error: archiveError?.message || "تعذر أرشفة المقهى" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    cafe: archived,
    message: "تمت أرشفة المقهى بأمان ولم يتم حذف بياناته.",
  });
}
