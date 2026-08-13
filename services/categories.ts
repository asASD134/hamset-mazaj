import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const TABLE_NAME = "categories";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Category[]) ?? [];
}

export async function createCategory(
  name: string,
  sortOrder = 0
): Promise<Category> {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("اسم التصنيف مطلوب");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      name_ar: cleanName,
      name_en: cleanName,
      image_url: null,
      sort_order: sortOrder,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Category;
}

export async function updateCategory(
  id: string,
  name: string,
  sortOrder?: number
): Promise<void> {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("اسم التصنيف مطلوب");
  }

  const payload: {
    name_ar: string;
    name_en: string;
    sort_order?: number;
  } = {
    name_ar: cleanName,
    name_en: cleanName,
  };

  if (sortOrder !== undefined) {
    payload.sort_order = sortOrder;
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteCategory(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}