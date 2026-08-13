import { supabase } from "@/lib/supabase";

export async function createCategory(
  name: string,
  sortOrder: number
) {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("اسم التصنيف مطلوب");
  }

  const { error } = await supabase
    .from("categories")
    .insert({
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
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCategory(
  id: string
) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}