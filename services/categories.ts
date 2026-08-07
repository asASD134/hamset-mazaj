import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
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

export async function createCategory(name: string) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      name,
      sort_order: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(
  id: string,
  name: string
) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      name,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}