import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";

export async function createCategory(
  name: string,
  sortOrder: number
) {
  const cafeId = await getClientCafeId();
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("اسم التصنيف مطلوب");
  }

  const { error } = await supabase
    .from("categories")
    .insert({
      cafe_id: cafeId,
      name_ar: cleanName,
      name_en: cleanName,
      image_url: null,
      sort_order: sortOrder,
      is_active: true,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCategory(
  id: string,
  name: string,
  sortOrder: number
) {
  const cafeId = await getClientCafeId();
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("اسم التصنيف مطلوب");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name_ar: cleanName,
      name_en: cleanName,
      sort_order: sortOrder,
    })
    .eq("id", id)
    .eq("cafe_id", cafeId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCategory(
  id: string
) {
  const cafeId = await getClientCafeId();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("cafe_id", cafeId);

  if (error) {
    throw new Error(error.message);
  }
}