import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_SLUG = "__platform_template__";

type AdminClient = ReturnType<typeof createAdminClient>;

async function requireSystemAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_system_admin");
  if (error || !data) return null;
  return createAdminClient();
}

async function getTemplate(admin: AdminClient) {
  const { data, error } = await admin
    .from("cafes")
    .select("id")
    .eq("slug", TEMPLATE_SLUG)
    .single();
  if (error || !data) throw new Error("قالب الإدارة العامة غير موجود.");
  return data.id as string;
}

async function getTargetCategoryId(
  admin: AdminClient,
  cafeId: string,
  templateCategory: { sort_order: number; name_ar: string }
) {
  const { data: exact } = await admin
    .from("categories")
    .select("id")
    .eq("cafe_id", cafeId)
    .eq("sort_order", templateCategory.sort_order)
    .eq("name_ar", templateCategory.name_ar)
    .maybeSingle();

  if (exact?.id) return exact.id as number;

  const { data: byOrder } = await admin
    .from("categories")
    .select("id")
    .eq("cafe_id", cafeId)
    .eq("sort_order", templateCategory.sort_order)
    .limit(1)
    .maybeSingle();

  return (byOrder?.id as number | null) ?? null;
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
      if (!item.category) {
        return NextResponse.json({ error: "تصنيف المنتج مطلوب." }, { status: 400 });
      }

      const { data: templateCategory, error: categoryError } = await admin
        .from("categories")
        .select("id, sort_order, name_ar")
        .eq("id", item.category)
        .eq("cafe_id", templateCafeId)
        .single();

      if (categoryError || !templateCategory) {
        return NextResponse.json({ error: "تصنيف المنتج غير موجود في القالب." }, { status: 400 });
      }

      const { data: cafes, error: cafesError } = await admin
        .from("cafes")
        .select("id")
        .eq("is_active", true);

      if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

      const platformKey = `menu-${crypto.randomUUID()}`;
      let updatedCount = 0;

      for (const cafe of cafes ?? []) {
        const categoryId = await getTargetCategoryId(admin, cafe.id, templateCategory);
        if (!categoryId) {
          return NextResponse.json({ error: `التصنيف المقابل غير موجود في ${cafe.id}.`, updatedCount }, { status: 500 });
        }

        const { error } = await admin.from("menu").insert({
          cafe_id: cafe.id,
          category_id: categoryId,
          platform_key: platformKey,
          name_ar: item.name,
          name_en: item.name,
          description_ar: item.description || null,
          description_en: item.description || null,
          price: item.price,
          calories: item.calories ?? null,
          image_url: item.image || null,
          is_available: item.available ?? true,
          is_featured: item.featured ?? false,
          sort_order: item.sort_order ?? 0,
        });

        if (error) {
          return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
        }
        updatedCount += 1;
      }

      return NextResponse.json({ ok: true, updatedCount });
    }

    const id = String(body?.id ?? "");
    if (!id) return NextResponse.json({ error: "معرّف المنتج مطلوب." }, { status: 400 });

    const { data: templateItem, error: itemError } = await admin
      .from("menu")
      .select("*")
      .eq("id", id)
      .eq("cafe_id", templateCafeId)
      .single();

    if (itemError || !templateItem) {
      return NextResponse.json({ error: "منتج القالب غير موجود." }, { status: 404 });
    }

    const { data: templateCategory, error: categoryError } = await admin
      .from("categories")
      .select("sort_order, name_ar")
      .eq("id", templateItem.category_id)
      .eq("cafe_id", templateCafeId)
      .single();

    if (categoryError || !templateCategory) {
      return NextResponse.json({ error: "تصنيف القالب غير موجود." }, { status: 500 });
    }

    const { data: cafes, error: cafesError } = await admin
      .from("cafes")
      .select("id")
      .neq("id", templateCafeId)
      .eq("is_active", true);

    if (cafesError) return NextResponse.json({ error: cafesError.message }, { status: 500 });

    const platformKey = templateItem.platform_key as string | null;

    if (!platformKey) {
      return NextResponse.json(
        { error: "هذا المنتج لا يملك مفتاح مزامنة. أعد تهيئة بيانات المنيو التجريبية مرة واحدة." },
        { status: 500 }
      );
    }

    if (action === "update") {
      const item = body?.item ?? {};
      const changed = {
        name_ar: item.name,
        name_en: item.name,
        description_ar: item.description || null,
        description_en: item.description || null,
        price: item.price,
        calories: item.calories ?? null,
        image_url: item.image || null,
        is_available: item.available ?? true,
        is_featured: item.featured ?? false,
        sort_order: item.sort_order ?? templateItem.sort_order,
      };

      const { error: templateUpdateError } = await admin
        .from("menu")
        .update(changed)
        .eq("id", id)
        .eq("cafe_id", templateCafeId);

      if (templateUpdateError) {
        return NextResponse.json({ error: templateUpdateError.message }, { status: 500 });
      }

      let updatedCount = 0;
      for (const cafe of cafes ?? []) {
        const { data: targetItem, error: targetError } = await admin
          .from("menu")
          .select("id")
          .eq("cafe_id", cafe.id)
          .eq("platform_key", platformKey)
          .maybeSingle();

        if (targetError) {
          return NextResponse.json({ error: targetError.message, updatedCount }, { status: 500 });
        }

        if (!targetItem?.id) {
          return NextResponse.json({ error: `المنتج المرتبط غير موجود في ${cafe.id}.`, updatedCount }, { status: 500 });
        }

        const { error } = await admin
          .from("menu")
          .update(changed)
          .eq("id", targetItem.id)
          .eq("cafe_id", cafe.id);

        if (error) return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
        updatedCount += 1;
      }

      return NextResponse.json({ ok: true, updatedCount });
    }

    if (action === "toggle") {
      const available = Boolean(body?.available);
      const { error: templateError } = await admin
        .from("menu")
        .update({ is_available: available })
        .eq("id", id)
        .eq("cafe_id", templateCafeId);

      if (templateError) return NextResponse.json({ error: templateError.message }, { status: 500 });

      let updatedCount = 0;
      for (const cafe of cafes ?? []) {
        const { error } = await admin
          .from("menu")
          .update({ is_available: available })
          .eq("cafe_id", cafe.id)
          .eq("platform_key", platformKey);

        if (error) return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
        updatedCount += 1;
      }

      return NextResponse.json({ ok: true, updatedCount });
    }

    if (action === "delete") {
      const { error: templateError } = await admin
        .from("menu")
        .delete()
        .eq("id", id)
        .eq("cafe_id", templateCafeId);

      if (templateError) return NextResponse.json({ error: templateError.message }, { status: 500 });

      let updatedCount = 0;
      for (const cafe of cafes ?? []) {
        const { error } = await admin
          .from("menu")
          .delete()
          .eq("cafe_id", cafe.id)
          .eq("platform_key", platformKey);

        if (error) return NextResponse.json({ error: error.message, updatedCount }, { status: 500 });
        updatedCount += 1;
      }

      return NextResponse.json({ ok: true, updatedCount });
    }

    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر نشر تحديث المنيو." },
      { status: 500 }
    );
  }
}
