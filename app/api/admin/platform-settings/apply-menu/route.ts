import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;
const TEMPLATE_SLUG = "__platform_template__";

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

async function getTemplate(admin: AdminClient) {
  const { data, error } = await admin.from("cafes").select("id").eq("slug", TEMPLATE_SLUG).single();
  if (error || !data) throw new Error("قالب الإدارة العامة غير موجود.");
  return data.id as string;
}

async function getTargetCategoryId(admin: AdminClient, cafeId: string, templateCategory: { sort_order: number; name_ar: string }) {
  const { data: exact } = await admin.from("categories").select("id").eq("cafe_id", cafeId).eq("sort_order", templateCategory.sort_order).eq("name_ar", templateCategory.name_ar).maybeSingle();
  if (exact?.id) return exact.id as number;
  const { data: byOrder } = await admin.from("categories").select("id").eq("cafe_id", cafeId).eq("sort_order", templateCategory.sort_order).limit(1).maybeSingle();
  return (byOrder?.id as number | undefined) ?? null;
}

async function getTargets(admin: AdminClient, templateCafeId: string) {
  const { data, error } = await admin.from("cafes").select("id").eq("is_active", true).neq("id", templateCafeId);
  if (error) throw error;
  return [templateCafeId, ...(data ?? []).map((c) => c.id as string)];
}

export async function POST(request: Request) {
  try {
    const admin = await requireSystemAdmin();
    if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || "");
    const templateCafeId = await getTemplate(admin);

    if (action === "create") {
      const item = body?.item ?? {};
      if (!item.category) return NextResponse.json({ error: "تصنيف المنتج مطلوب." }, { status: 400 });

      const { data: templateCategory, error: categoryError } = await admin
        .from("categories")
        .select("id, sort_order, name_ar")
        .eq("id", item.category)
        .eq("cafe_id", templateCafeId)
        .single();
      if (categoryError || !templateCategory) return NextResponse.json({ error: "تصنيف المنتج غير موجود في القالب." }, { status: 400 });

      const platformKey = `menu-${crypto.randomUUID()}`;
      for (const cafeId of await getTargets(admin, templateCafeId)) {
        const categoryId = cafeId === templateCafeId ? (templateCategory.id as number) : await getTargetCategoryId(admin, cafeId, templateCategory);
        if (!categoryId) throw new Error(`التصنيف المقابل غير موجود في ${cafeId}.`);
        const { error } = await admin.from("menu").insert({ cafe_id: cafeId, category_id: categoryId, platform_key: platformKey, name_ar: item.name, name_en: item.name, description_ar: item.description || null, description_en: item.description || null, price: item.price, calories: item.calories ?? null, image_url: item.image || null, is_available: item.available ?? true, is_featured: item.featured ?? false, sort_order: item.sort_order ?? 0 });
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, updatedCount: (await getTargets(admin, templateCafeId)).length, platformKey });
    }

    const id = String(body?.id ?? "");
    if (!id) return NextResponse.json({ error: "معرّف المنتج مطلوب." }, { status: 400 });

    const { data: templateItem, error: itemError } = await admin.from("menu").select("*").eq("id", id).eq("cafe_id", templateCafeId).single();
    if (itemError || !templateItem) return NextResponse.json({ error: "منتج القالب غير موجود." }, { status: 404 });
    const platformKey = templateItem.platform_key as string | null;
    if (!platformKey) return NextResponse.json({ error: "هذا المنتج لا يملك مفتاح مزامنة." }, { status: 409 });

    const targets = await getTargets(admin, templateCafeId);
    if (action === "update") {
      const item = body?.item ?? {};
      const changed = { name_ar: item.name, name_en: item.name, description_ar: item.description || null, description_en: item.description || null, price: item.price, calories: item.calories ?? null, image_url: item.image || null, is_available: item.available ?? true, is_featured: item.featured ?? false, sort_order: item.sort_order ?? templateItem.sort_order };
      for (const cafeId of targets) {
        const { error } = await admin.from("menu").update(changed).eq("cafe_id", cafeId).eq("platform_key", platformKey);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, updatedCount: targets.length });
    }

    if (action === "toggle") {
      const available = Boolean(body?.available);
      for (const cafeId of targets) {
        const { error } = await admin.from("menu").update({ is_available: available }).eq("cafe_id", cafeId).eq("platform_key", platformKey);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, updatedCount: targets.length });
    }

    if (action === "delete") {
      for (const cafeId of targets) {
        const { error } = await admin.from("menu").delete().eq("cafe_id", cafeId).eq("platform_key", platformKey);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, updatedCount: targets.length });
    }

    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر نشر تحديث المنيو." }, { status: 500 });
  }
}
