import { supabase } from "@/lib/supabase";

export async function createCategory(
  name: string,
  sortOrder: number
) {
  const { error } = await supabase.from("categories").insert({
    name_ar: name,
    name_en: name,
    image_url: "",
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) throw new Error(error.message);
}

export async function updateCategory(
  id: number,
  name: string,
  sortOrder: number
) {
  const { error } = await supabase
    .from("categories")
    .update({
      name_ar: name,
      name_en: name,
      sort_order: sortOrder,
      is_active: true,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteCategory(id: number) {
  const confirmed = confirm("هل تريد حذف هذا التصنيف؟");

  if (!confirmed) return;

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}