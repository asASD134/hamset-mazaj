import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
import { MenuItem, CreateMenuItem, UpdateMenuItem } from "@/types/menu";

const TABLE_NAME = "menu";

function mapMenuItem(item: any): MenuItem {
  return {
    id: String(item.id),
    name: item.name_ar ?? "",
    description: item.description_ar ?? "",
    price: Number(item.price ?? 0),
    image: item.image_url ?? "",
    category: String(item.category_id ?? ""),
    available: Boolean(item.is_available),
    featured: Boolean(item.is_featured),
    sort_order: Number(item.sort_order ?? 0),
    created_at: item.created_at ?? "",
  };
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("cafe_id", cafeId).order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).eq("cafe_id", cafeId).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return mapMenuItem(data);
}

export async function createMenuItem(item: CreateMenuItem): Promise<MenuItem> {
  const name = item.name.trim();
  const description = item.description.trim();
  if (!name) throw new Error("اسم المنتج مطلوب");
  if (!item.category) throw new Error("يجب اختيار التصنيف");
  if (!Number.isFinite(item.price) || item.price < 0) throw new Error("السعر غير صحيح");
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).insert({
    cafe_id: cafeId,
    category_id: item.category,
    name_ar: name,
    name_en: name,
    description_ar: description,
    description_en: description,
    price: item.price,
    image_url: item.image || null,
    is_available: item.available,
    is_featured: item.featured ?? false,
    sort_order: item.sort_order,
  }).select("*").single();
  if (error) throw error;
  return mapMenuItem(data);
}

export async function updateMenuItem(item: UpdateMenuItem): Promise<MenuItem> {
  const name = item.name.trim();
  const description = item.description.trim();
  if (!name) throw new Error("اسم المنتج مطلوب");
  if (!item.category) throw new Error("يجب اختيار التصنيف");
  if (!Number.isFinite(item.price) || item.price < 0) throw new Error("السعر غير صحيح");
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).update({
    category_id: item.category,
    name_ar: name,
    name_en: name,
    description_ar: description,
    description_en: description,
    price: item.price,
    image_url: item.image || null,
    is_available: item.available,
    is_featured: item.featured ?? false,
    sort_order: item.sort_order,
  }).eq("id", item.id).eq("cafe_id", cafeId).select("*").single();
  if (error) throw error;
  return mapMenuItem(data);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const cafeId = await getClientCafeId();
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id).eq("cafe_id", cafeId);
  if (error) throw error;
}

export async function toggleMenuAvailability(id: string, available: boolean): Promise<void> {
  const cafeId = await getClientCafeId();
  const { error } = await supabase.from(TABLE_NAME).update({ is_available: available }).eq("id", id).eq("cafe_id", cafeId);
  if (error) throw error;
}
